#!/usr/bin/env python3
"""
JarvisOS Backend Server Startup Script
"""
import os
import sys
import subprocess
import platform

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} detected")

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install requirements")
        sys.exit(1)

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting JarvisOS Backend Server...")
    try:
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    print("🤖 JarvisOS Backend Server")
    print("=" * 40)
    
    check_python_version()
    
    # Check if requirements.txt exists
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found")
        sys.exit(1)
    
    # Install requirements if needed
    try:
        import fastapi
        import uvicorn
        import psutil
        print("✅ Dependencies already installed")
    except ImportError:
        install_requirements()
    
    start_server()