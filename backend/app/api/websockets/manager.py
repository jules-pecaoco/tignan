from typing import Any
from fastapi import WebSocket

class ConnectionManager:
    """
    Manages  WebSocket connections partitioned by event ID.
    
    This manager holds active connections in memory, allowing the server to 
    broadcast localized updates specifically to coordinators
    viewing a given disaster event dashboard.
    """
    
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, event_id: str):
        """
        Accepts a new WebSocket connection and registers it to a specific event.
        """
        await websocket.accept()
        if event_id not in self.active_connections:
            self.active_connections[event_id] = []
        self.active_connections[event_id].append(websocket)

    def disconnect(self, websocket: WebSocket, event_id: str):
        """
        Removes a dropped connection and safely garbage-collects empty event pools.
        """
        if event_id in self.active_connections:
            self.active_connections[event_id].remove(websocket)
            # Clean up memory if no one is watching this event anymore
            if not self.active_connections[event_id]:
                del self.active_connections[event_id]

    async def broadcast_to_event(self, event_id: str, message: dict[str, Any]):
        """
        Broadcasts a JSON-serializable payload to all active clients within an event.
        
        Args:
            event_id: The unique identifier for the disaster event.
            message: A dictionary containing the payload to be serialized to JSON.
        """
        if event_id in self.active_connections:
            for connection in self.active_connections[event_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # TODO: Not sure whether to ignore dropped websocket connection
                    # or to do something
                    pass

manager = ConnectionManager()
