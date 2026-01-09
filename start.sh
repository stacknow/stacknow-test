#!/bin/sh

# 1. Start SSH Daemon in the background
echo "Starting SSH Daemon..."
/usr/sbin/sshd -D -e &

# 2. Start Node Server Instance A (Port 8080)
echo "Starting Node Server A..."
export PORT=8080
export INSTANCE_NAME="Primary-Server"
node server.js &

# 3. Start Node Server Instance B (Port 8081)
echo "Starting Node Server B..."
export PORT=8081
export INSTANCE_NAME="Secondary-Server"
node server.js &

# 4. Wait for all background processes to prevent container from exiting
wait
