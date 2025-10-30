# Redis Setup for Polaris v3 Monorepo

## 🏗️ Project Structure

This is a monorepo with the following structure:
```
polaris-v3/                 # Project root (where Vercel KV should be configured)
├── frontend/               # Next.js application
│   ├── lib/cache/redis.ts  # Redis client implementation
│   └── .env.local          # Frontend-specific env vars
├── .env.local              # Project root env vars (Vercel uses this)
└── vercel.json             # Vercel configuration
```

## 🚀 Vercel KV Setup Steps

### Step 1: Create Vercel KV Database

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Select your project:** `polaris-v3` (not frontend)
3. **Navigate to Storage tab**
4. **Click "Create Database" → "KV"**
5. **Choose region** (US East or US West recommended)
6. **Click "Create"**

### Step 2: Get Your Credentials

1. **Click on your new KV database**
2. **Go to ".env.local" tab**
3. **Copy these two values:**
   ```
   KV_REST_API_URL=https://your-kv-id.kv.vercel-storage.com
   KV_REST_API_TOKEN=abcdef123456...
   ```

### Step 3: Update Environment Variables

**Update the project root `.env.local` file:**

```bash
# Navigate to project root
cd /path/to/polaris-v3

# Edit .env.local file
nano .env.local
```

**Replace these lines:**
```bash
REDIS_URL="redis://localhost:6379/0"
# REDIS_URL="https://your-kv-id.kv.vercel-storage.com"  # TODO: Update with Vercel KV URL
# REDIS_TOKEN="your_kv_rest_api_token_here"          # TODO: Update with Vercel KV token
```

**With your actual credentials:**
```bash
# REDIS_URL="redis://localhost:6379/0"  # Comment this out for production
REDIS_URL="https://your-kv-id.kv.vercel-storage.com"
REDIS_TOKEN="your_actual_kv_rest_api_token_here"
```

### Step 4: Add to Vercel Production Environment

1. **Go to Vercel Dashboard** → Your project `polaris-v3`
2. **Click "Settings" → "Environment Variables"**
3. **Add these variables:**
   - **Name:** `REDIS_URL`
   - **Value:** `https://your-kv-id.kv.vercel-storage.com`
   - **Name:** `REDIS_TOKEN`
   - **Value:** `your_actual_kv_rest_api_token_here`
4. **Select environments:** Production, Preview, Development
5. **Click "Save"**
6. **Redeploy your application**

## 🔍 Testing Your Setup

### Option 1: Use the Setup Script
```bash
cd /path/to/polaris-v3
npm run setup:vercel-kv
```

### Option 2: Test Redis Directly
```bash
cd /path/to/polaris-v3/frontend
npm run test:redis
```

### Option 3: Check Health Endpoint
```bash
# Test locally
curl http://localhost:3000/api/monitoring/redis-health

# Test production
curl https://your-app.vercel.app/api/monitoring/redis-health
```

## 📊 Expected Results

Once configured, you should see:

**Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-30T...",
  "redis": {
    "connected": true,
    "latency": 45,
    "error": null
  },
  "api": {
    "responseTime": "52ms",
    "endpoint": "/api/monitoring/redis-health"
  },
  "environment": "production",
  "version": "1.0.0"
}
```

**Build Logs:**
```
✅ Redis connection successful
✅ Enhanced cache: Using Redis for production
✅ Rate limiting: Using Redis distributed rate limiting
```

## 🚨 Troubleshooting

### "Redis URL not found, using memory cache only"
- **Cause:** REDIS_URL not set or not accessible
- **Fix:** Check environment variables in Vercel dashboard

### "Authentication failed"
- **Cause:** Invalid REDIS_TOKEN
- **Fix:** Verify token from Vercel KV dashboard

### "Redis connection refused"
- **Cause:** Incorrect URL format or network issues
- **Fix:** Ensure URL includes https:// and matches KV_REST_API_URL

### "KV database not found"
- **Cause:** KV database created under wrong project
- **Fix:** Ensure KV is created under `polaris-v3` project, not `frontend`

## 🛠️ Development vs Production

**Development (Local):**
```bash
# Use local Redis for development
REDIS_URL=redis://localhost:6379/0
# REDIS_TOKEN=  # Not needed for local Redis
```

**Production (Vercel):**
```bash
# Use Vercel KV for production
REDIS_URL=https://your-kv-id.kv.vercel-storage.com
REDIS_TOKEN=your_kv_rest_api_token
```

## 📈 Benefits Once Configured

✅ **Distributed Rate Limiting** - Works across multiple server instances
✅ **Response Caching** - Faster API responses and reduced load
✅ **Session Storage** - Improved user experience with persistent sessions
✅ **Production Monitoring** - Real-time metrics and health checks
✅ **Scalability** - Redis scales with your application traffic

## 🎯 Quick Validation

After setup, run these commands to verify:

```bash
# 1. Test Redis connection
npm run test:redis

# 2. Check application build
npm run build

# 3. Verify monitoring endpoint
curl http://localhost:3000/api/monitoring/status
```

All should show healthy Redis connections! 🚀