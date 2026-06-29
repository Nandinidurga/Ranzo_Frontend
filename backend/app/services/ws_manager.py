import asyncio
from typing import Dict, List
import json
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        # Maps user_id to a list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
            except ValueError:
                pass
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def notify_users(self, user_ids: List[str], event_name: str, payload: dict):
        message = json.dumps({"event": event_name, "data": payload})
        print(f"[WS_MANAGER] Notifying users {user_ids} of event {event_name}")
        for uid in user_ids:
            if uid in self.active_connections:
                print(f"[WS_MANAGER] Sending to {uid} ({len(self.active_connections[uid])} connections)")
                for ws in self.active_connections[uid]:
                    try:
                        await ws.send_text(message)
                    except Exception as e:
                        print(f"[WS_MANAGER] Failed to send to {uid}: {e}")
            else:
                print(f"[WS_MANAGER] User {uid} NOT in active connections!")

ws_manager = WebSocketManager()
