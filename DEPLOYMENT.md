# Audio Sync Platform - Production Deployment Guide

This guide covers deploying the Audio Sync Platform to production environments including AWS, GCP, Azure, and self-hosted infrastructure.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Docker Production Build](#docker-production-build)
4. [Cloud Deployment Options](#cloud-deployment-options)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Disaster Recovery](#backup--disaster-recovery)
8. [Scaling Strategies](#scaling-strategies)
9. [Security Hardening](#security-hardening)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production:

### Code & Configuration
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance benchmarks meet targets
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Domain names registered
- [ ] CDN configured (optional)

### Infrastructure
- [ ] Server/VM provisioned
- [ ] Database backups configured
- [ ] Monitoring tools installed
- [ ] Log aggregation setup
- [ ] Firewall rules configured
- [ ] Load balancer ready (if needed)

### Documentation
- [ ] Deployment runbook created
- [ ] Rollback procedure documented
- [ ] Incident response plan ready
- [ ] Team trained on deployment process

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# Node Environment
NODE_ENV=production

# Application
PORT=4000
CORS_ORIGIN=https://your-domain.com

# Streaming
STREAM_URL=https://audio-source.com/stream.mp3
HLS_TIME=2
HLS_LIST_SIZE=10
ENABLE_LOOP=false

# OCR Service
OCR_SERVICE_URL=http://ocr:3001
OCR_INPUT_PATH=/ocr/input
OCR_OUTPUT_PATH=/ocr/output

# Storage
STORAGE_PATH=/storage
INDEX_DB_PATH=/storage/index/segments.db

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
PROMETHEUS_PORT=9090

# CDN (optional)
CDN_URL=https://cdn.your-domain.com
CDN_ENABLED=true
```

### Frontend Environment Variables

Create `.env.production` for frontend:

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

---

## Docker Production Build

### Production docker-compose.yml

```yaml
version: '3.9'

services:
  ffmpeg-worker:
    build:
      context: ./streaming/ffmpeg-worker
      dockerfile: Dockerfile
    container_name: audio-sync-ffmpeg-prod
    environment:
      - STREAM_URL=${STREAM_URL}
      - HLS_TIME=2
      - HLS_LIST_SIZE=10
      - ENABLE_LOOP=${ENABLE_LOOP:-false}
    volumes:
      - hls-storage:/storage/hls
    restart: always
    networks:
      - audio-sync-network
    healthcheck:
      test: ["CMD-SHELL", "ls /storage/hls/*.m3u8 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  indexer:
    build:
      context: ./streaming/indexer
      dockerfile: Dockerfile
    container_name: audio-sync-indexer-prod
    environment:
      - NODE_ENV=production
      - HLS_PATH=/storage/hls
      - INDEX_DB_PATH=/storage/index/segments.db
      - SEGMENT_DURATION=2
    volumes:
      - hls-storage:/storage/hls:ro
      - index-storage:/storage/index
    depends_on:
      ffmpeg-worker:
        condition: service_healthy
    restart: always
    networks:
      - audio-sync-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  ocr:
    build:
      context: ./streaming/ocr
      dockerfile: Dockerfile
    container_name: audio-sync-ocr-prod
    environment:
      - NODE_ENV=production
      - PORT=3001
      - OCR_INPUT_PATH=/ocr/input
      - OCR_OUTPUT_PATH=/ocr/output
    volumes:
      - ocr-storage:/ocr
    restart: always
    networks:
      - audio-sync-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1G

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: audio-sync-backend-prod
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - STORAGE_PATH=/storage
      - INDEX_DB_PATH=/storage/index/segments.db
      - CORS_ORIGIN=${CORS_ORIGIN}
      - OCR_SERVICE_URL=http://ocr:3001
      - JWT_SECRET=${JWT_SECRET}
      - LOG_LEVEL=info
    volumes:
      - hls-storage:/storage/hls:ro
      - index-storage:/storage/index:ro
      - ocr-storage:/ocr
    depends_on:
      - indexer
      - ocr
    restart: always
    networks:
      - audio-sync-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:4000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: audio-sync-frontend-prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      backend:
        condition: service_healthy
    restart: always
    networks:
      - audio-sync-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: audio-sync-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/cache:/var/cache/nginx
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - audio-sync-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

volumes:
  hls-storage:
    driver: local
  index-storage:
    driver: local
  ocr-storage:
    driver: local

networks:
  audio-sync-network:
    driver: bridge
```

### Production Dockerfiles

**Backend Dockerfile.prod:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 4000

CMD ["node", "dist/main.js"]
```

**Frontend Dockerfile.prod:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## Cloud Deployment Options

### Option 1: AWS (EC2 + RDS)

**Infrastructure Setup:**
```bash
# 1. Create EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key \
  --security-group-ids sg-xxx \
  --subnet-id subnet-xxx

# 2. Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Deploy application
git clone your-repo
cd audio-sync-platform
docker-compose -f docker-compose.prod.yml up -d
```

**AWS Cost Estimate:**
```
EC2 t3.medium:     ~$30/month
EBS Storage (50GB): ~$5/month
Data Transfer:      ~$10/month
---------------------------------
Total:             ~$45/month
```

### Option 2: Google Cloud Platform (GKE)

**Kubernetes Deployment:**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: audio-sync-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: gcr.io/your-project/audio-sync-backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

**Deploy to GKE:**
```bash
# 1. Create GKE cluster
gcloud container clusters create audio-sync-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2

# 2. Build and push images
docker build -t gcr.io/your-project/audio-sync-backend:latest ./backend
docker push gcr.io/your-project/audio-sync-backend:latest

# 3. Deploy
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### Option 3: DigitalOcean (Droplet)

**One-Click Deployment:**
```bash
# 1. Create droplet
doctl compute droplet create audio-sync \
  --size s-2vcpu-4gb \
  --image docker-20-04 \
  --region nyc1

# 2. SSH and deploy
ssh root@your-droplet-ip
git clone your-repo
cd audio-sync-platform
docker-compose -f docker-compose.prod.yml up -d

# 3. Configure firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**DigitalOcean Cost:**
```
Droplet (2vCPU, 4GB):  ~$24/month
Block Storage (50GB):  ~$5/month
---------------------------------
Total:                 ~$29/month
```

### Option 4: Self-Hosted (VPS)

**Recommended Specs:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- Network: 100 Mbps

**Setup Script:**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying Audio Sync Platform..."

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/your-repo/audio-sync-platform.git
cd audio-sync-platform

# Configure environment
cp .env.example .env.production
nano .env.production  # Edit manually

# Deploy
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"
echo "🌐 Frontend: http://your-domain.com"
echo "🔧 Backend: http://your-domain.com:4000"
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
# /etc/nginx/sites-available/audio-sync
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS
        add_header Access-Control-Allow-Origin "https://your-domain.com";
        add_header Access-Control-Allow-Credentials "true";
    }

    # HLS Segments (cache)
    location /api/hls/ {
        proxy_pass http://backend:4000/api/hls/;
        proxy_cache hls_cache;
        proxy_cache_valid 200 2s;
        proxy_cache_key "$uri";
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

---

## Monitoring & Logging

### Prometheus + Grafana

**docker-compose monitoring.yml:**
```yaml
version: '3.9'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - audio-sync-network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your-password
    networks:
      - audio-sync-network

volumes:
  prometheus-data:
  grafana-data:
```

### ELK Stack for Logs

```yaml
version: '3.9'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  es-data:
```

---

## Backup & Disaster Recovery

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup SQLite database
docker exec audio-sync-backend \
  sqlite3 /storage/index/segments.db ".backup /tmp/backup.db"
docker cp audio-sync-backend:/tmp/backup.db \
  $BACKUP_DIR/segments_$DATE.db

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env.production docker-compose.prod.yml

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR s3://your-bucket/backups/ --recursive

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "✅ Backup complete: $DATE"
```

### Disaster Recovery Procedure

**1. Data Loss Recovery:**
```bash
# Restore database
aws s3 cp s3://your-bucket/backups/segments_latest.db ./segments.db
docker cp segments.db audio-sync-backend:/storage/index/segments.db
docker restart audio-sync-backend
```

**2. Complete System Recovery:**
```bash
# Fresh deployment
git clone your-repo
cd audio-sync-platform

# Restore config
aws s3 cp s3://your-bucket/backups/config_latest.tar.gz .
tar -xzf config_latest.tar.gz

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Restore data
./restore.sh
```

---

## Scaling Strategies

### Horizontal Scaling

**Load Balancer Configuration:**
```nginx
upstream backend_servers {
    least_conn;
    server backend1:4000 max_fails=3 fail_timeout=30s;
    server backend2:4000 max_fails=3 fail_timeout=30s;
    server backend3:4000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl;
    location /api/ {
        proxy_pass http://backend_servers;
    }
}
```

### Vertical Scaling

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # Increase from 1.0
      memory: 2G       # Increase from 512M
    reservations:
      cpus: '1.0'
      memory: 1G
```

---

## Security Hardening

### Checklist

- [ ] Enable HTTPS/TLS
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up fail2ban
- [ ] Use secrets management (Vault/AWS Secrets Manager)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Disable debug endpoints in production
- [ ] Use non-root users in containers
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities (Snyk/Dependabot)

---

## Troubleshooting

### Common Issues

**Service Won't Start:**
```bash
docker logs audio-sync-backend
docker-compose ps
systemctl status docker
```

**High CPU Usage:**
```bash
docker stats
htop
```

**Out of Memory:**
```bash
free -h
docker system prune -a
```

---

**Version**: 1.0.0
**Last Updated**: December 11, 2025