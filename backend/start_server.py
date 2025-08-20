#!/usr/bin/env python3
"""
Безпечний запуск backend сервера з автоматичним звільненням порту
"""

import os
import sys
import time
import socket
import subprocess
import psutil
from pathlib import Path

def check_port_in_use(port):
    """Перевіряє чи зайнятий порт"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except OSError:
            return True

def find_process_using_port(port):
    """Знаходить процеси, які використовують порт"""
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
    """Вбиває процеси на вказаному порту"""
    processes = find_process_using_port(port)
    
    if not processes:
        print(f"✅ Порт {port} вільний")
        return True
    
    print(f"⚠️  Знайдено {len(processes)} процес(ів) на порту {port}")
    
    for proc_info in processes:
        try:
            pid = proc_info['pid']
            name = proc_info['name']
            print(f"  Вбиваємо процес: {name} (PID: {pid})")
            
            proc = psutil.Process(pid)
            proc.terminate()
            
            # Чекаємо до 3 секунд на завершення
            try:
                proc.wait(timeout=3)
            except psutil.TimeoutExpired:
                print(f"  Примусове завершення процесу {pid}")
                proc.kill()
                
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            print(f"  ❌ Не вдалося завершити процес {pid}: {e}")
    
    # Перевіряємо чи порт звільнився
    time.sleep(1)
    if check_port_in_use(port):
        print(f"❌ Не вдалося звільнити порт {port}")
        return False
    else:
        print(f"✅ Порт {port} звільнено")
        return True

def start_uvicorn():
    """Запускає uvicorn сервер"""
    PORT = 8001
    
    print("=" * 50)
    print("  БЕЗПЕЧНИЙ ЗАПУСК BACKEND СЕРВЕРА")
    print("=" * 50)
    print()
    
    # Перевіряємо чи ми в правильній директорії
    if not Path("app/main.py").exists():
        print("❌ Файл app/main.py не знайдено")
        print(f"Поточна директорія: {os.getcwd()}")
        print("Запустіть скрипт з директорії backend")
        return 1
    
    print("✅ Знайдено app/main.py")
    print()
    
    # Перевіряємо та звільняємо порт
    print(f"1. Перевіряємо порт {PORT}...")
    if not kill_processes_on_port(PORT):
        print("❌ Не вдалося звільнити порт. Спробуйте перезапустити комп'ютер.")
        return 1
    
    print()
    print(f"2. Запуск сервера на порту {PORT}...")
    print(f"Backend буде доступний на: http://127.0.0.1:{PORT}")
    print(f"Документація API: http://127.0.0.1:{PORT}/docs")
    print()
    print("Для зупинки сервера натисніть Ctrl+C")
    print()
    
    try:
        # Запускаємо uvicorn
        cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", str(PORT)]
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n🛑 Сервер зупинено користувачем")
    except Exception as e:
        print(f"❌ Помилка запуску сервера: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(start_uvicorn())