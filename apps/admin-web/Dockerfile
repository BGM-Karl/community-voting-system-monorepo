# Stage 1: Build the admin-web application
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# git clone project
RUN git clone https://github.com/BGM-Karl/community-voting-system-monorepo.git

# Install pnpm (assuming the Rush.js project uses pnpm)
RUN npm install -g pnpm

# Install Rush.js
RUN npm install -g @microsoft/rush

# Set working directory
WORKDIR /app/community-voting-system-monorepo

# Install project dependencies
RUN rush update

# Build the shared module
WORKDIR /app/community-voting-system-monorepo/packages/shared
RUN rushx build

# Build the admin-web application
WORKDIR /app/community-voting-system-monorepo/apps/admin-web
RUN rushx build

# Stage 2: Set up NGINX and run the service
FROM nginx:alpine AS runner

# Copy the built admin-web files to NGINX's static service directory
COPY --from=builder /app/community-voting-system-monorepo/apps/admin-web/dist /usr/share/nginx/html

# Copy custom NGINX configuration file (optional)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose NGINX's port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]

# $ docker build -f ./Dockerfile -t admin-web .  --no-cache