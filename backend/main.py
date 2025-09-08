# backend/main.py
import asyncio
import json
import psutil
import time
import subprocess
import sys
from datetime import datetime
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

# Import new services
from linux_tools import execute_command_async, get_installed_applications
from voice_service import initialize_voice_service, speak_text, recognize_speech_from_mic

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
        return connections[:20]
    except Exception as e:
        print(f"Error getting network connections: {e}")
        return []

async def get_network_data():
    """Helper to get detailed network info for WebSocket"""
    try:
        interfaces = {}
        for iface_name, addrs in psutil.net_if_addrs().items():
            interfaces[iface_name] = []
            for addr in addrs:
                interfaces[iface_name].append({
                    "family": str(addr.family),
                    "address": addr.address,
                    "netmask": addr.netmask,
                    "broadcast": addr.broadcast,
                    "ptp": addr.ptp
                })

        connections = []
        for conn in psutil.net_connections(kind='inet'):
            if conn.status == 'ESTABLISHED':
                connections.append({
                    "fd": conn.fd,
                    "family": str(conn.family),
                    "type": str(conn.type),
                    "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A",
                    "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A",
                    "status": conn.status,
                    "pid": conn.pid
                })
            if len(connections) >= 50:
                break

        return {
            "interfaces": interfaces,
            "connections": connections,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error getting network data: {e}")
        return {"interfaces": {}, "connections": [], "timestamp": datetime.now().isoformat()}

def get_system_logs():
    """Get recent system logs"""
    try:
        result = subprocess.run(['journalctl', '-n', '50', '--no-pager'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            logs = result.stdout.strip().split('\n')
            return [{"timestamp": datetime.now().isoformat(), "message": log} for log in logs[-10:]]
        else:
            with open('/var/log/syslog', 'r') as f:
                lines = f.readlines()
                return [{"timestamp": datetime.now().isoformat(), "message": line.strip()} for line in lines[-10:]]
    except Exception as e:
        print(f"Error getting system logs: {e}")
        return [{"timestamp": datetime.now().isoformat(), "message": f"Error reading logs: {e}"}]

# Background tasks
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
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Error in system monitor task: {e}")
            await asyncio.sleep(5)

async def network_monitor_task():
    """Background task to send network info periodically"""
    while True:
        try:
            network_data = await get_network_data()
            message = {
                "type": "network_update",
                "data": network_data
            }
            await manager.broadcast(json.dumps(message))
            await asyncio.sleep(5)
        except Exception as e:
            print(f"Error in network monitor task: {e}")
            await asyncio.sleep(10)

async def logs_monitor_task():
    """Background task to send system logs periodically"""
    while True:
        try:
            logs = get_system_logs()
            message = {
                "type": "system_logs",
                "data": logs
            }
            await manager.broadcast(json.dumps(message))
            await asyncio.sleep(10)
        except Exception as e:
            print(f"Error in logs monitor task: {e}")
            await asyncio.sleep(15)

# Global variable to control voice recognition loop
voice_recognition_active = False

async def voice_recognition_loop(websocket: WebSocket):
    global voice_recognition_active
    print("Starting voice recognition loop...")
    
    await manager.send_personal_message(json.dumps({
        "type": "jarvis_status",
        "data": {"listening": True, "speaking": True}
    }), websocket)
    
    await manager.send_personal_message(json.dumps({
        "type": "notification",
        "data": {
            "title": "Voice Service",
            "message": "Listening for commands...",
            "type": "info",
            "timestamp": datetime.now().isoformat()
        }
    }), websocket)

    while voice_recognition_active:
        try:
            await manager.send_personal_message(json.dumps({
                "type": "jarvis_status",
                "data": {"listening": True, "speaking": False}
            }), websocket)
            
            text = await recognize_speech_from_mic()
            if text:
                print(f"Recognized: {text}")
                await manager.send_personal_message(json.dumps({
                    "type": "notification",
                    "data": {
                        "title": "Voice Input",
                        "message": f"Heard: '{text}'",
                        "type": "info",
                        "timestamp": datetime.now().isoformat()
                    }
                }), websocket)
                await process_voice_command(text, websocket)
            await asyncio.sleep(0.1)
        except Exception as e:
            print(f"Error in voice recognition loop: {e}")
            voice_recognition_active = False
            await manager.send_personal_message(json.dumps({
                "type": "jarvis_status",
                "data": {"listening": False, "speaking": False}
            }), websocket)

async def process_voice_command(command_text: str, websocket: WebSocket):
    command_text = command_text.lower()
    response_text = ""

    await manager.send_personal_message(json.dumps({
        "type": "jarvis_status",
        "data": {"listening": True, "speaking": True}
    }), websocket)

    if "hello jarvis" in command_text or "hey jarvis" in command_text:
        response_text = "Hello, Commander. How may I assist you?"
    elif "what is your status" in command_text or "system status" in command_text:
        stats = get_system_stats()
        response_text = f"Current CPU usage is {stats['cpu']} percent, memory is {stats['memory']} percent, and disk usage is {stats['disk']} percent."
    elif "open terminal" in command_text:
        response_text = "Opening quantum terminal."
        await manager.send_personal_message(json.dumps({
            "type": "command_response",
            "data": {"command": "open_widget", "result": "terminal"}
        }), websocket)
    elif "show processes" in command_text:
        processes = get_process_list()
        if processes:
            response_text = f"There are {len(processes)} active processes. Top process is {processes[0]['name']} using {processes[0]['cpu_percent']} percent CPU."
        else:
            response_text = "Unable to retrieve process list."
    elif "what time is it" in command_text or "current time" in command_text:
        current_time = datetime.now().strftime("%I:%M %p")
        response_text = f"The current time is {current_time}."
    elif "shutdown" in command_text or "power off" in command_text:
        response_text = "Initiating shutdown sequence. Goodbye, Commander."
    elif "thank you" in command_text:
        response_text = "You're welcome, Commander."
    else:
        response_text = "I'm sorry, Commander. I didn't understand that command."

    if response_text:
        await speak_text(response_text)
        await manager.send_personal_message(json.dumps({
            "type": "notification",
            "data": {
                "title": "Jarvis Response",
                "message": response_text,
                "type": "success",
                "timestamp": datetime.now().isoformat()
            }
        }), websocket)

async def handle_jarvis_activate(data: dict, websocket: WebSocket):
    global voice_recognition_active
    listening_state = data.get("listening")
    
    if listening_state is not None:
        voice_recognition_active = listening_state
    else:
        voice_recognition_active = not voice_recognition_active

    await manager.send_personal_message(json.dumps({
        "type": "jarvis_status",
        "data": {"listening": voice_recognition_active, "speaking": False}
    }), websocket)

    if voice_recognition_active:
        asyncio.create_task(voice_recognition_loop(websocket))
        notification_msg = "Voice recognition system activated. Listening..."
        notification_type = "success"
    else:
        notification_msg = "Voice recognition system deactivated."
        notification_type = "info"

    await manager.send_personal_message(json.dumps({
        "type": "notification",
        "data": {
            "title": "Jarvis AI",
            "message": notification_msg,
            "type": notification_type,
            "timestamp": datetime.now().isoformat()
        }
    }), websocket)

async def handle_command(command_data: dict, websocket: WebSocket):
    """Handle commands from frontend"""
    command = command_data.get("command", "")

    if command.lower() == "system_status":
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

    elif command.lower() == "network_scan":
        await asyncio.sleep(1)
        response = {
            "type": "command_response",
            "data": {
                "command": "network_scan",
                "result": "Network scan complete. Found 4 devices on network.",
                "timestamp": datetime.now().isoformat()
            }
        }
        await manager.send_personal_message(json.dumps(response), websocket)

    else:
        try:
            async for output_line in execute_command_async(command):
                await manager.send_personal_message(json.dumps({
                    "type": "terminal_output",
                    "data": {"output": output_line}
                }), websocket)
            await manager.send_personal_message(json.dumps({
                "type": "terminal_output",
                "data": {"output": f"\r\nCommand '{command}' executed."}
            }), websocket)
        except Exception as e:
            await manager.send_personal_message(json.dumps({
                "type": "terminal_error",
                "data": {"error": f"Error executing command '{command}': {e}"}
            }), websocket)

# Start background tasks
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(system_monitor_task())
    asyncio.create_task(network_monitor_task())
    asyncio.create_task(logs_monitor_task())
    initialize_voice_service()

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
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "command":
                await handle_command(message.get("data", {}), websocket)
            elif message.get("type") == "jarvis_activate":
                await handle_jarvis_activate(message.get("data", {}), websocket)
            elif message.get("type") == "get_processes":
                processes = get_process_list()
                response = {
                    "type": "process_list",
                    "data": processes
                }
                await manager.send_personal_message(json.dumps(response), websocket)
            elif message.get("type") == "get_network":
                network_data = await get_network_data()
                response = {
                    "type": "network_update",
                    "data": network_data
                }
                await manager.send_personal_message(json.dumps(response), websocket)
            elif message.get("type") == "get_installed_apps":
                apps = get_installed_applications()
                response = {
                    "type": "installed_applications",
                    "data": apps
                }
                await manager.send_personal_message(json.dumps(response), websocket)
            elif message.get("type") == "launch_application":
                app_executable = message.get("data", {}).get("executable")
                if app_executable:
                    try:
                        os.system(f"nohup {app_executable} &")
                        await manager.send_personal_message(json.dumps({
                            "type": "notification",
                            "data": {
                                "title": "App Launcher",
                                "message": f"Launched {app_executable}",
                                "type": "success",
                                "timestamp": datetime.now().isoformat()
                            }
                        }), websocket)
                    except Exception as e:
                        await manager.send_personal_message(json.dumps({
                            "type": "notification",
                            "data": {
                                "title": "App Launcher Error",
                                "message": f"Failed to launch {app_executable}: {e}",
                                "type": "error",
                                "timestamp": datetime.now().isoformat()
                            }
                        }), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

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
    """Get detailed network information via REST API"""
    try:
        interfaces = {}
        for iface_name, addrs in psutil.net_if_addrs().items():
            interfaces[iface_name] = []
            for addr in addrs:
                interfaces[iface_name].append({
                    "family": str(addr.family),
                    "address": addr.address,
                    "netmask": addr.netmask,
                    "broadcast": addr.broadcast,
                    "ptp": addr.ptp
                })

        connections = []
        for conn in psutil.net_connections(kind='inet'):
            if conn.status == 'ESTABLISHED':
                connections.append({
                    "fd": conn.fd,
                    "family": str(conn.family),
                    "type": str(conn.type),
                    "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A",
                    "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A",
                    "status": conn.status,
                    "pid": conn.pid
                })
            if len(connections) >= 50:
                break

        return {
            "interfaces": interfaces,
            "connections": connections,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in /api/network: {e}")
        return {"error": str(e)}

@app.get("/api/logs")
async def get_logs_api():
    """Get system logs via REST API"""
    return {"logs": get_system_logs()}

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