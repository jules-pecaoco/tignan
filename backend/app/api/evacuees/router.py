from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, Session

from app.models import Evacuee, Event
from app.api.evacuees.schemas import EvacueeEnrollRequest
from app.db.database import get_session


router = APIRouter(prefix="/api/v1/enroll", tags=["Evacuees"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_evacuee_enrollment(
        enroll_request: EvacueeEnrollRequest,
        db: Session = Depends(get_session)
):
    statement = select(Event).where(Event.join_code == enroll_request.join_code)
    event: Event | None = db.exec(statement).first()

    # # Check to see if join_code is a valid code, will return None if not
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Join Code. No Join Code found."
        )

    # Check to see if event is still active
    elif not event.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Event is no longer active"
        )

    # Check if evacuee has already registered
    evacuee_select_stmt = (select(Evacuee)
                                .where(Evacuee.phone_number == enroll_request.phone_number,
                                       Evacuee.event_id == event.id))
    evacuee: Evacuee | None = db.exec(evacuee_select_stmt).first()

    # If query returns a user it means it is a duplicate
    # Raise error to avoid duplicates
    if evacuee:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already joined evacuation event"
        )

    # Create user and adds to event regardless if new or preexisting user
    # Simplified model schema to minimize junction tables
    new_evacuee: Evacuee = Evacuee(
        **enroll_request.model_dump(exclude={"join_code"}),
        event_id=event.id
    )
    db.add(new_evacuee)
    db.commit()
    db.refresh(new_evacuee)
    return new_evacuee
