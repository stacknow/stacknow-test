# --- Stage 1: Build Stage ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Stage 2: Final Production Stage ---
FROM node:18-alpine

# 1. Install SSH Server and Client
RUN apk add --no-cache openssh-server openssh-client

# 2. Generate SSH host keys (Required for Alpine sshd)
RUN ssh-keygen -A

# 3. Create .ssh directory for the node user
RUN mkdir -p /home/node/.ssh && chown node:node /home/node/.ssh

WORKDIR /app

# 4. Copy application files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# 5. Copy the startup script and make it executable
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# 6. Expose Port 8080 (Server 1), 8081 (Server 2), and 22 (SSH)
EXPOSE 8080 8081 22

# 7. Start the shell script
CMD ["./start.sh"]
