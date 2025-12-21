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

# --- Stage 2: Nginx Reverse Proxy (Baking the Secret) ---
FROM nginx:alpine

# 1. Accept the Secret URL as a Build Argument
ARG TARGET_URL="https://static.stacknow.dev/default-fallback.html"

# Install gettext for envsubst (useful if we still want runtime flexibility, but not strictly needed for baking)
RUN apk add --no-cache gettext

# Copy assets
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/pkg /usr/share/nginx/html/pkg
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# 2. BAKE THE URL INTO THE CONFIG
# We replace the variable inside the template RIGHT NOW during the build.
# We use | as delimiter to handle slashes in the URL.
RUN envsubst '${TARGET_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# 3. Ensure MIME types
RUN sed -i 's/}/    application\/wasm wasm;\n}/' /etc/nginx/mime.types

EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]