# --- Stage 1: Build WASM ---
FROM rust:1.75-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY index.html ./

# Build WASM
RUN wasm-pack build --target web --out-name stacknow_bootloader --out-dir pkg

# --- Stage 2: Nginx Reverse Proxy ---
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy built assets
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/pkg /usr/share/nginx/html/pkg

# Copy Nginx Configuration Template
# We use a template so we can inject the env var at runtime
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Use the default Nginx entrypoint structure which processes templates in /etc/nginx/templates/
# automatically if using a recent nginx image, BUT to be safe and explicit:
ENV TARGET_URL="https://static.stacknow.dev/thrive-hero-2.html"

# We must ensure Nginx handles the WASM MIME type
RUN sed -i 's/}/    application\/wasm wasm;\n}/' /etc/nginx/mime.types

EXPOSE 80

# The official nginx:alpine image runs a script that checks /docker-entrypoint.d/
# and processes templates ending in .template using envsubst.
# So we just need to place our file in /etc/nginx/templates/ and name it *.template