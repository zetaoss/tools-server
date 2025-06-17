# Stage 1: Build static files
FROM node:22 AS builder
WORKDIR /app
COPY ../ ./
RUN npm ci && npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf