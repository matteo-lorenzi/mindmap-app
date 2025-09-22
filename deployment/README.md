# MindMap App Deployment Guide

## 🚀 Quick Deployment Options

### 1. GitHub Pages (Frontend Only)
**Best for**: Static frontend demonstration

```bash
cd client
npm run build
npm install -g gh-pages
gh-pages -d dist
```

### 2. Vercel + Railway (Recommended)
**Best for**: Full-stack production deployment

#### Frontend (Vercel):
1. Connect your GitHub repo to Vercel
2. Set build directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-railway-app.railway.app`

#### Backend (Railway):
1. Connect your GitHub repo to Railway
2. Set root directory to `server`
3. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

### 3. Docker Deployment
```bash
# Build and run locally
docker-compose -f deployment/docker-compose.yml up --build

# Deploy to any cloud provider with Docker support
```

## 🔧 Environment Setup

### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Server (.env)
```env
NODE_ENV=production
DATABASE_URL="your-database-url"
JWT_SECRET="your-super-secret-key"
CLIENT_URL="https://your-frontend-domain.com"
PORT=5000
```

## 📊 Production Checklist

- [ ] Environment variables configured
- [ ] Database setup and migrated
- [ ] CORS configured for production domains
- [ ] SSL certificates enabled
- [ ] Error monitoring setup (Sentry, LogRocket)
- [ ] Analytics setup (Google Analytics, Plausible)

## 🌐 Live Demo

Once deployed, your app will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-api.railway.app`