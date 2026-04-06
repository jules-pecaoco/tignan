import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.models import Alert, AlertStatus
from app.api.alerts.schemas import AlertAcknowledgeRequest
from app.db.database import get_session

router = APIRouter(prefix="/api/v1/alerts", tags=["Alert Management"])

@router.patch("/{alert_id}/acknowledge", status_code=status.HTTP_200_OK)
def acknowledge_alert(
    alert_id: uuid.UUID,
    payload: AlertAcknowledgeRequest,
    db: Session = Depends(get_session)
):
    # Fetch alert data
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found."
        )

    # If alert is already resolved, raise error as it is unecessary
    if alert.status == AlertStatus.RESOLVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot acknowledge an alert that is already resolved."
        )

    # Update the alert
    alert.status = AlertStatus.ACKNOWLEDGED
    if payload.responder_id:
        alert.responder_id = payload.responder_id

    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    return alert


@router.patch("/{alert_id}/resolve", status_code=status.HTTP_200_OK)
def resolve_alert(
    alert_id: uuid.UUID,
    db: Session = Depends(get_session)
):
    # Fetch alert data
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found."
        )

    # Catches instances where resolve alert was clicked twice, avoid duplication
    if alert.status == AlertStatus.RESOLVED:
        return alert

    alert.status = AlertStatus.RESOLVED
    alert.resolved_at = datetime.now(tz=timezone.utc)

    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    return alert
