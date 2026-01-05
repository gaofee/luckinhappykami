# Use Node.js 18 LTS with Debian base for better Python compatibility
FROM node:18-bullseye-slim

# Set environment variables for faster downloads
ENV NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
ENV NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
ENV SASS_BINARY_SITE=https://npmmirror.com/mirrors/node-sass/
ENV ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
ENV PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors/
ENV CHROMIUM_DOWNLOAD_HOST=https://npmmirror.com/mirrors/chromium-browser-snapshots/

# Set working directory
WORKDIR /app

# Install system dependencies needed for SQLite and building
RUN echo 'deb http://mirrors.ustc.edu.cn/debian/ bullseye main contrib non-free' > /etc/apt/sources.list && \
    echo 'deb http://mirrors.ustc.edu.cn/debian/ bullseye-updates main contrib non-free' >> /etc/apt/sources.list && \
    echo 'deb http://mirrors.ustc.edu.cn/debian-security/ bullseye-security main contrib non-free' >> /etc/apt/sources.list && \
    echo 'Acquire::Retries "3";' > /etc/apt/apt.conf.d/99retries && \
    echo 'Acquire::http::Timeout "120";' >> /etc/apt/apt.conf.d/99retries && \
    apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    libsqlite3-dev \
    python3 \
    python3-dev \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p data uploads dist/public

# Ensure data directory is writable
RUN chmod 755 data uploads dist/public

# Install frontend dependencies and build
RUN cd frontend && \
    npm config set registry https://registry.npmmirror.com && \
    npm ci && \
    echo "Frontend dependencies installed" && \
    npm run build && \
    echo "Frontend build completed"

# Copy frontend build output to the correct location
RUN mkdir -p dist/public && \
    cp -r frontend/dist/* dist/public/ && \
    echo "Frontend files copied to dist/public"

# Verify frontend build output
RUN echo "Checking frontend build output:" && \
    ls -la dist/public/ && \
    echo "Build output verification complete"

# Build the backend application
RUN npm run build:server

# Initialize database (as root before switching to nodejs user)
RUN echo "Initializing database..." && \
    mkdir -p /app/data && \
    NODE_ENV=production npm run init-db && \
    ls -la /app/data/

# Remove dev dependencies to reduce image size
RUN npm prune --production && cd frontend && npm prune --production

# Create non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nodejs

# Change ownership of app directory and ensure data directory is writable
RUN chown -R nodejs:nodejs /app && \
    chmod 755 /app/data /app/uploads /app/dist

# Copy nginx configuration for the nginx service
RUN mkdir -p /etc/nginx/conf.d && \
    echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 8091;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Frontend routing' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # API proxy to Node.js app' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /api {' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass http://luckinhappykami:3000;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_http_version 1.1;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Upgrade $http_upgrade;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Connection '"'"'upgrade'"'"';' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_cache_bypass $http_upgrade;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Static files' >> /etc/nginx/conf.d/default.conf && \
    echo '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri =404;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Security headers' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header Referrer-Policy "no-referrer-when-downgrade" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header Content-Security-Policy "default-src '"'"'self'"'"' http: https: data: blob: '"'"'unsafe-inline'"'"'" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]
