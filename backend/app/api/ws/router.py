from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.manager import manager

router = APIRouter(prefix="/ws/v1", tags=["WebSockets"])

@router.websocket("/events/{event_id}")
async def websocket_event_dashboard(websocket: WebSocket, event_id: str):
    # Recieve and accept connection and add to the event
    await manager.connect(websocket, event_id)
    try:
        while True:
            # Keep connection alive, use receive text to detect if browser is still open
            await websocket.receive_text()
    except WebSocketDisconnect:
        # Cleanup after disconnection
        manager.disconnect(websocket, event_id)
