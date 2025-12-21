FROM codercom/code-server:latest

# Switch to root to install system dependencies
USER root

# Install standard tools (git, curl, python, build-essential)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Switch back to the 'coder' user
USER coder

# (Optional) Pre-install VS Code extensions
# Note: code-server uses the Open VSX registry by default
RUN code-server --install-extension ms-python.python

# Set the workspace directory
WORKDIR /home/coder/project

# Expose port
EXPOSE 8080

# Start code-server with password authentication enabled
ENV PASSWORD=coder
ENTRYPOINT ["/usr/bin/entrypoint.sh", "--bind-addr", "0.0.0.0:8080", "."]