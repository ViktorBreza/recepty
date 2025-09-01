#!/usr/bin/env python3
"""
Safe backend server startup with automatic port cleanup
"""

import os
import sys
import time
import socket
import subprocess
import psutil
from pathlib import Path

def check_port_in_use(port):
    """Checks if port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except OSError:
            return True

def find_process_using_port(port):
    """Finds processes using the port"""
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'connections']):
        try:
            for conn in proc.info['connections'] or []:
                if conn.laddr.port == port:
                    processes.append(proc.info)
                    break
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return processes

def kill_processes_on_port(port):
    """Kills processes on the specified port"""
    processes = find_process_using_port(port)
    
    if not processes:
        print(f"✅ Port {port} is free")
        return True
    
    print(f"⚠️  Found {len(processes)} process(es) on port {port}")
    
    for proc_info in processes:
        try:
            pid = proc_info['pid']
            name = proc_info['name']
            print(f"  Killing process: {name} (PID: {pid})")
            
            proc = psutil.Process(pid)
            proc.terminate()
            
            # Wait up to 3 seconds for termination
            try:
                proc.wait(timeout=3)
            except psutil.TimeoutExpired:
                print(f"  Force killing process {pid}")
                proc.kill()
                
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            print(f"  ❌ Failed to terminate process {pid}: {e}")
    
    # Check if port was freed
    time.sleep(1)
    if check_port_in_use(port):
        print(f"❌ Failed to free port {port}")
        return False
    else:
        print(f"✅ Port {port} freed")
        return True

def start_uvicorn():
    """Starts uvicorn server"""
    PORT = 8000
    
    print("=" * 50)
    print("  SAFE BACKEND SERVER STARTUP")
    print("=" * 50)
    print()
    
    # Check if we're in the correct directory
    if not Path("app/main.py").exists():
        print("❌ File app/main.py not found")
        print(f"Current directory: {os.getcwd()}")
        print("Run script from backend directory")
        return 1
    
    print("✅ Found app/main.py")
    print()
    
    # Check and free port
    print(f"1. Checking port {PORT}...")
    if not kill_processes_on_port(PORT):
        print("❌ Failed to free port. Try restarting computer.")
        return 1
    
    print()
    print(f"2. Starting server on port {PORT}...")
    print(f"Backend will be available at: http://127.0.0.1:{PORT}")
    print(f"API documentation: http://127.0.0.1:{PORT}/docs")
    print()
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        # Start uvicorn
        cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", str(PORT)]
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server startup error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(start_uvicorn())