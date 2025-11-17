# --- Stage 1: Build Stage ---
# Use an official Node.js image as a builder. We use an LTS version.
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# --- Stage 2: Final Production Stage ---
# Start from a clean, lightweight Node.js image
FROM node:18-alpine

WORKDIR /app

# Copy dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the application code and package.json from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# Expose the port the app runs on. Your platform will use this.
EXPOSE 8080

# Run the container as a non-root user for better security
USER node

# The command to run when the container starts
CMD [ "npm", "start" ]