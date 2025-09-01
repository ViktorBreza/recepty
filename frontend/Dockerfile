# Multi-stage build for optimized Pi 5 deployment
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment for production build
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://localhost:8000

# Build the React app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -g 1001 -S kitkuhar && \
    adduser -S kitkuhar -u 1001

# Set proper permissions
RUN chown -R kitkuhar:kitkuhar /usr/share/nginx/html && \
    chown -R kitkuhar:kitkuhar /var/cache/nginx && \
    chown -R kitkuhar:kitkuhar /var/log/nginx && \
    chown -R kitkuhar:kitkuhar /etc/nginx/conf.d

# Switch to non-root user
USER kitkuhar

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]