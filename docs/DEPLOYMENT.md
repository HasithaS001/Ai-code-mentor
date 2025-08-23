# AI Code Mentor - Deployment & Setup Guide

## 📋 Overview

This guide provides comprehensive instructions for setting up, configuring, and deploying the AI Code Mentor application in various environments.

## 🔧 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm/yarn/pnpm**: Latest stable version
- **Git**: For repository cloning functionality
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: At least 1GB free space

### Required API Keys
- **Google Gemini AI API Key**: For code analysis and explanations
- **Google Cloud Credentials** (Optional): For text-to-speech functionality
- **AWS Credentials** (Optional): For AWS Polly TTS
- **ElevenLabs API Key** (Optional): For premium voice synthesis

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-code-mentor.git
cd ai-code-mentor
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Required - Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Optional - Google Cloud Text-to-Speech
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Optional - AWS Polly
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Optional - ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Optional - Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Obtain API Keys

#### Google Gemini AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

#### Google Cloud Text-to-Speech (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Text-to-Speech API
4. Create a service account
5. Download the JSON key file
6. Extract the required fields for your `.env.local`

#### AWS Polly Setup (Optional)
1. Sign in to [AWS Console](https://aws.amazon.com/console/)
2. Go to IAM and create a new user
3. Attach the `AmazonPollyFullAccess` policy
4. Generate access keys
5. Add keys to your `.env.local`

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Production Deployment

### Vercel Deployment (Recommended)

#### 1. Prepare for Deployment
```bash
# Build the application locally to test
npm run build
npm run start
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to configure your project
```

#### 3. Configure Environment Variables
In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required environment variables
3. Redeploy the application

#### 4. Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Netlify Deployment

#### 1. Build Configuration
Create a `netlify.toml` file:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy
1. Connect your GitHub repository to Netlify
2. Configure build settings
3. Add environment variables
4. Deploy

### Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Build and Run
```bash
# Build Docker image
docker build -t ai-code-mentor .

# Run container
docker run -p 3000:3000 --env-file .env.local ai-code-mentor
```

### Self-Hosted Deployment

#### 1. Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt recommended)

#### 2. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 3. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-username/ai-code-mentor.git
cd ai-code-mentor

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "ai-code-mentor" -- start
pm2 save
pm2 startup
```

#### 4. Nginx Configuration
Create `/etc/nginx/sites-available/ai-code-mentor`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ai-code-mentor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Security Configuration

### Environment Variables Security
- Never commit `.env` files to version control
- Use different API keys for development and production
- Rotate API keys regularly
- Use environment variable management services

### HTTPS Configuration
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers
Add to your Nginx configuration:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 Monitoring & Maintenance

### Health Checks
Create a health check endpoint in your application:
```typescript
// pages/api/health.ts
export default function handler(req: NextRequest, res: NextResponse) {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
}
```

### Logging
Configure structured logging:
```bash
# PM2 logs
pm2 logs ai-code-mentor

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backup_${DATE}.tar.gz" /path/to/ai-code-mentor
# Upload to cloud storage
```

## 🔧 Troubleshooting

### Common Issues

#### 1. API Key Issues
```bash
# Check environment variables
echo $GEMINI_API_KEY

# Test API connection
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1/models
```

#### 2. Build Failures
```bash
# Clear cache
npm run clean
rm -rf .next node_modules
npm install
npm run build
```

#### 3. Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### 4. Port Conflicts
```bash
# Check port usage
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Performance Optimization

#### 1. Enable Compression
```nginx
# In Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

#### 2. Caching Strategy
```nginx
# Static assets caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Database Optimization (if applicable)
- Use connection pooling
- Implement query caching
- Regular database maintenance

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers (Nginx, HAProxy)
- Implement session storage (Redis)
- Database clustering
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize application performance
- Monitor resource usage

### Monitoring Tools
- **Application**: New Relic, DataDog
- **Infrastructure**: Prometheus, Grafana
- **Logs**: ELK Stack, Splunk
- **Uptime**: Pingdom, UptimeRobot
