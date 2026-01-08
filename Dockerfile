# --- Stage 1: Build Stage ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Stage 2: Final Production Stage ---
FROM node:18-alpine

# 1. Install SSH Server (NOT just client)
RUN apk add --no-cache openssh-server openssh-client

# 2. Generate SSH host keys (Required for sshd to start on Alpine)
RUN ssh-keygen -A

# 3. Create the directory for the node user's authorized keys (Kubernetes mounts keys here)
RUN mkdir -p /home/node/.ssh && chown node:node /home/node/.ssh

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# Expose app port AND SSH port
EXPOSE 8080 22

# 4. Start SSH Daemon in the background, then start the Node app
# Note: We run as root initially to start sshd, but the node process should ideally drop privileges if possible. 
# For simplicity in this setup, we keep the entrypoint simple:
CMD ["/bin/sh", "-c", "/usr/sbin/sshd -D -e & npm start"]
