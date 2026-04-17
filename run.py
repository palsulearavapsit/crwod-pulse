import subprocess
import os
import sys

def main():
    # Setup correct absolute paths based on where this script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, 'backend')
    frontend_dir = os.path.join(base_dir, 'frontend')

    print("🚀 Starting CrowdPulse Backend (Port 3000)...")
    backend = subprocess.Popen(
        "node server.js",
        cwd=backend_dir,
        shell=True
    )

    print("🚀 Starting CrowdPulse Frontend (Vite)...")
    frontend = subprocess.Popen(
        "npm run dev",
        cwd=frontend_dir,
        shell=True
    )

    try:
        # Keep the script running to keep the background processes alive
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down CrowdPulse...")
        backend.terminate()
        frontend.terminate()
        sys.exit(0)

if __name__ == '__main__':
    main()
