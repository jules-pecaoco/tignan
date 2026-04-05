from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlmodel import select, Session, col

from app.models import Event, Evacuee, Alert, AlertType, AlertStatus
from app.api.events.schemas import EventCreateRequest, DashboardResponse
from app.db.database import get_session

router = APIRouter(prefix="/api/v1/events", tags=["Events & Dashboard"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreateRequest,
    db: Session = Depends(get_session)
):
    # Check if the join code is already taken by another event
    statement = select(Event).where(Event.join_code == payload.join_code)
    existing_event = db.exec(statement).first()
    
    if existing_event:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"The join code '{payload.join_code}' is already in use."
        )

    # Create the new event
    new_event = Event(**payload.model_dump())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return new_event


@router.get("/{event_id}/dashboard", response_model=DashboardResponse)
def get_event_dashboard(
    event_id: str, # UUIDs are passed as strings in the URL path
    db: Session = Depends(get_session)
):
    # Verify that the event actually exists
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found."
        )

    # Count the number of evacuees
    evacuee_count_stmt = select(func.count(col(Evacuee.id))).where(Evacuee.event_id == event.id)
    total_evacuees = db.exec(evacuee_count_stmt).one()

    # Count the number of Active SOS Alerts
    sos_count_stmt = select(func.count(col(Alert.id))).where(
        Alert.event_id == event.id,
        Alert.alert_type == AlertType.SOS,
        Alert.status == AlertStatus.OPEN
    )
    total_active_sos = db.exec(sos_count_stmt).one()

    # Count the number of Low Battery Alerts
    battery_count_stmt = select(func.count(col(Alert.id))).where(
        Alert.event_id == event.id,
        Alert.alert_type == AlertType.LOW_BATTERY,
        Alert.status == AlertStatus.OPEN
    )
    total_active_battery = db.exec(battery_count_stmt).one()

    # Fetch the actual Urgent Alerts (Limit to oldest 10 unresolved)
    # Fetch the oldest urgent alert as they have been waiting the longest
    alerts_stmt = (
        select(Alert)
        .where(Alert.event_id == event.id, Alert.status == AlertStatus.OPEN)
        .order_by(col(Alert.created_at))
        .limit(10)
    )
    urgent_alerts_raw = db.exec(alerts_stmt).all()
    
    # Format the alerts into a clean list of dictionaries for the frontend
    urgent_alerts = [
        {
            "id": str(alert.id),
            "type": alert.alert_type.value,
            "evacuee_id": str(alert.evacuee_id),
            "created_at": alert.created_at.isoformat()
        }
        for alert in urgent_alerts_raw
    ]

    # Return the Dashboard Data in a clean response format
    return DashboardResponse(
        event_name=event.name,
        is_active=event.is_active,
        total_evacuees=total_evacuees,
        total_active_sos=total_active_sos,
        total_active_battery=total_active_battery,
        urgent_alerts=urgent_alerts
    )
