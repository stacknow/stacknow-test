# --- Stage 1: Build ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Stage 2: Production ---
FROM node:18-alpine

# 1. Install SSH (Required for the Tunnel to connect)
RUN apk add --no-cache openssh-server

# 2. Setup SSH Keys (Required for Alpine sshd)
RUN ssh-keygen -A

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# 3. ONLY Expose the Web Port (Ingress will only see this)
EXPOSE 8080

# 4. Start SSH in background (silent), then start App
# The Tunnel Agent will connect to localhost:22 or service:22 internally
CMD ["/bin/sh", "-c", "/usr/sbin/sshd -D & npm start"]
