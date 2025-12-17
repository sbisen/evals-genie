# Render Deployment Guide for EvalsGenie

This guide provides step-by-step instructions for deploying both the backend and frontend on Render.

## Project Structure

```
EvalsGenieUI/
├── backend/          # Python FastAPI backend
└── frontend/         # React + Vite frontend
```

---

## 🚀 Backend Deployment (FastAPI)

### 1. Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `https://github.com/ledionanishani/EvalsGenieUI-.git`

### 2. Configure Backend Service

**Basic Settings:**
- **Name:** `evalsgenie-backend` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Python 3`

**Build & Deploy Settings:**
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```

- **Start Command:**
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### 3. Environment Variables

Add these environment variables in Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `MONGODB_URI` | `your-mongodb-connection-string` | MongoDB Atlas connection string |
| `SECRET_KEY` | `your-secret-key-here` | JWT secret key (generate a secure random string) |
| `PYTHON_VERSION` | `3.11.0` | Python version |

**To generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Deploy

- Click **"Create Web Service"**
- Render will automatically deploy your backend
- Note the backend URL (e.g., `https://evalsgenie-backend.onrender.com`)

---

## 🎨 Frontend Deployment (React + Vite)

### 1. Create a New Static Site

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect the same GitHub repository

### 2. Configure Frontend Service

**Basic Settings:**
- **Name:** `evalsgenie-frontend` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `frontend`

**Build & Deploy Settings:**
- **Build Command:**
  ```bash
  npm install && npm run build
  ```

- **Publish Directory:**
  ```bash
  dist
  ```

### 3. Environment Variables

Add this environment variable:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_API_URL` | `https://evalsgenie-backend.onrender.com` | Your backend URL from step 1 |

**Important:** Replace `evalsgenie-backend.onrender.com` with your actual backend URL.

### 4. Deploy

- Click **"Create Static Site"**
- Render will build and deploy your frontend
- Your frontend will be available at `https://evalsgenie-frontend.onrender.com`

---

## 📝 Quick Deployment Commands Summary

### Backend
```bash
# Build Command
pip install -r requirements.txt

# Start Command
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend
```bash
# Build Command
npm install && npm run build

# Publish Directory
dist
```

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings

In `backend/main.py`, update the CORS origins to include your frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://evalsgenie-frontend.onrender.com",  # Your frontend URL
        "http://localhost:5173",  # Keep for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Test Your Deployment

1. Visit your frontend URL
2. Try logging in
3. Check that API calls work correctly
4. Monitor logs in Render dashboard for any errors

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to your `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Both services will automatically rebuild and redeploy.

---

## 📊 Monitoring & Logs

### View Logs
1. Go to your service in Render dashboard
2. Click on **"Logs"** tab
3. Monitor real-time logs for debugging

### Health Checks
- Backend health: `https://your-backend-url.onrender.com/healthz`
- Backend API docs: `https://your-backend-url.onrender.com/docs`

---

## 💰 Pricing Notes

- **Free Tier:** Both services can run on Render's free tier
- **Limitations:** 
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
- **Upgrade:** Consider paid plans for production use to avoid spin-down

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Service fails to start
- Check logs for Python errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Problem:** CORS errors
- Update `allow_origins` in `main.py`
- Redeploy backend after changes

### Frontend Issues

**Problem:** API calls fail
- Verify `VITE_API_URL` is set correctly
- Check browser console for errors
- Ensure backend is running

**Problem:** Build fails
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Review build logs in Render dashboard

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## ✅ Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] MongoDB connection working
- [ ] Frontend can communicate with backend
- [ ] Authentication working
- [ ] All features tested in production

---

**Need Help?** Check Render's support documentation or review the logs for specific error messages.