from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, Session

from app.models import (
    CheckIn, 
    Evacuee, 
    Alert, 
    CheckInStatus, 
    AlertType, 
    AlertStatus
)
from app.api.checkins.schemas import CheckInCreateRequest
from app.db.database import get_session

router = APIRouter(prefix="/api/v1/checkins", tags=["Check-Ins"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_checkin(
    payload: CheckInCreateRequest,
    db: Session = Depends(get_session)
):
    # Returns existing record if this is a duplicate request because of possible connection issues
    idempotency_stmt = select(CheckIn).where(CheckIn.idempotency_key == payload.idempotency_key)
    existing_checkin = db.exec(idempotency_stmt).first()
    
    if existing_checkin:
        return existing_checkin

    # Query for the evacuee
    evacuee = db.get(Evacuee, payload.evacuee_id)
    
    # Raise error if evacuee does not exist
    if not evacuee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evacuee not found. Please re-enroll."
        )

    # Create the check_in and save to memory for now
    new_checkin = CheckIn(**payload.model_dump())
    db.add(new_checkin)

    if payload.status == CheckInStatus.CRITICAL:
        # Check if they already have an OPEN SOS alert so we don't spam the dashboard
        sos_check_stmt = select(Alert).where(
            Alert.evacuee_id == evacuee.id,
            Alert.alert_type == AlertType.SOS,
            Alert.status == AlertStatus.OPEN
        )
        if not db.exec(sos_check_stmt).first():
            new_sos_alert = Alert(
                event_id=evacuee.event_id,
                evacuee_id=evacuee.id,
                alert_type=AlertType.SOS
            )
            db.add(new_sos_alert)

    # Check for low batter (15% or less)
    if payload.battery_level is not None and payload.battery_level <= 15:
        battery_check_stmt = select(Alert).where(
            Alert.evacuee_id == evacuee.id,
            Alert.alert_type == AlertType.LOW_BATTERY,
            Alert.status == AlertStatus.OPEN
        )
        if not db.exec(battery_check_stmt).first():
            new_battery_alert = Alert(
                event_id=evacuee.event_id,
                evacuee_id=evacuee.id,
                alert_type=AlertType.LOW_BATTERY
            )
            db.add(new_battery_alert)

    db.commit()
    db.refresh(new_checkin)
    
    return new_checkin
