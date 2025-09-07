# backend/main.py
import asyncio
import json
import psutil
import time
from datetime import datetime
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI(title="JarvisOS Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# System monitoring functions
def get_system_stats():
    """Get current system statistics"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Network stats
        net_io = psutil.net_io_counters()
        
        return {
            "cpu": round(cpu_percent, 1),
            "memory": round(memory.percent, 1),
            "disk": round((disk.used / disk.total) * 100, 1),
            "network": {
                "bytes_sent": net_io.bytes_sent,
                "bytes_recv": net_io.bytes_recv,
                "packets_sent": net_io.packets_sent,
                "packets_recv": net_io.packets_recv
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error getting system stats: {e}")
        return {
            "cpu": 0,
            "memory": 0,
            "disk": 0,
            "network": {"bytes_sent": 0, "bytes_recv": 0, "packets_sent": 0, "packets_recv": 0},
            "timestamp": datetime.now().isoformat()
        }

def get_process_list():
    """Get list of running processes"""
    try:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        return sorted(processes, key=lambda x: x['cpu_percent'] or 0, reverse=True)[:10]
    except Exception as e:
        print(f"Error getting process list: {e}")
        return []

def get_network_connections():
    """Get network connections"""
    try:
        connections = []
        for conn in psutil.net_connections(kind='inet'):
            if conn.status == 'ESTABLISHED':
                connections.append({
                    "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A",
                    "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A",
                    "status": conn.status,
                    "pid": conn.pid
                })
        return connections[:20]  # Limit to 20 connections
    except Exception as e:
        print(f"Error getting network connections: {e}")
        return []

# Background task to send system updates
async def system_monitor_task():
    """Background task to monitor system and send updates"""
    while True:
        try:
            stats = get_system_stats()
            message = {
                "type": "system_stats",
                "data": stats
            }
            await manager.broadcast(json.dumps(message))
            await asyncio.sleep(2)  # Send updates every 2 seconds
        except Exception as e:
            print(f"Error in system monitor task: {e}")
            await asyncio.sleep(5)

# Start background task
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(system_monitor_task())

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    # Send welcome message
    welcome_message = {
        "type": "notification",
        "data": {
            "title": "Backend Connected",
            "message": "JarvisOS backend server is online",
            "type": "success",
            "timestamp": datetime.now().isoformat()
        }
    }
    await manager.send_personal_message(json.dumps(welcome_message), websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "command":
                await handle_command(message.get("data", {}), websocket)
            elif message.get("type") == "get_processes":
                processes = get_process_list()
                response = {
                    "type": "process_list",
                    "data": processes
                }
                await manager.send_personal_message(json.dumps(response), websocket)
            elif message.get("type") == "get_network":
                connections = get_network_connections()
                response = {
                    "type": "network_connections",
                    "data": connections
                }
                await manager.send_personal_message(json.dumps(response), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def handle_command(command_data: dict, websocket: WebSocket):
    """Handle commands from frontend"""
    command = command_data.get("command", "").lower()
    
    if command == "system_status":
        stats = get_system_stats()
        response = {
            "type": "command_response",
            "data": {
                "command": "system_status",
                "result": f"CPU: {stats['cpu']}% | Memory: {stats['memory']}% | Disk: {stats['disk']}%",
                "timestamp": datetime.now().isoformat()
            }
        }
        await manager.send_personal_message(json.dumps(response), websocket)
    
    elif command == "network_scan":
        # Simulate network scan
        await asyncio.sleep(1)  # Simulate scan time
        response = {
            "type": "command_response",
            "data": {
                "command": "network_scan",
                "result": "Network scan complete. Found 4 devices on network.",
                "timestamp": datetime.now().isoformat()
            }
        }
        await manager.send_personal_message(json.dumps(response), websocket)
    
    elif command == "jarvis_activate":
        response = {
            "type": "jarvis_status",
            "data": {
                "listening": True,
                "speaking": False,
                "processing": False
            }
        }
        await manager.send_personal_message(json.dumps(response), websocket)
        
        # Send notification
        notification = {
            "type": "notification",
            "data": {
                "title": "Jarvis AI",
                "message": "Voice recognition system activated",
                "type": "success",
                "timestamp": datetime.now().isoformat()
            }
        }
        await manager.send_personal_message(json.dumps(notification), websocket)

# REST API endpoints
@app.get("/api/system/info")
async def get_system_info():
    """Get system information"""
    try:
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        return {
            "hostname": psutil.os.uname().nodename,
            "platform": psutil.os.uname().system,
            "architecture": psutil.os.uname().machine,
            "boot_time": boot_time.isoformat(),
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "disk_total": psutil.disk_usage('/').total,
            "uptime": str(datetime.now() - boot_time)
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/system/stats")
async def get_system_stats_api():
    """Get current system stats via REST API"""
    return get_system_stats()

@app.get("/api/processes")
async def get_processes_api():
    """Get running processes via REST API"""
    return {"processes": get_process_list()}

@app.get("/api/network")
async def get_network_api():
    """Get network information via REST API"""
    return {
        "connections": get_network_connections(),
        "interfaces": dict(psutil.net_if_addrs())
    }

@app.post("/api/notifications")
async def send_notification(notification: dict):
    """Send notification to all connected clients"""
    message = {
        "type": "notification",
        "data": {
            **notification,
            "timestamp": datetime.now().isoformat()
        }
    }
    await manager.broadcast(json.dumps(message))
    return {"status": "sent"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "connections": len(manager.active_connections)
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
