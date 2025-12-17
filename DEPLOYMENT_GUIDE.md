# 🚀 VieUrl Deployment Guide

## Complete Step-by-Step Hosting on Vercel (Frontend) + Render (Backend)

---

## 📋 Prerequisites

Before you begin, make sure you have:
- A **GitHub account** (required for both Vercel and Render)
- Your project pushed to a **GitHub repository**

---

## Part 1: Push Your Project to GitHub

### Step 1.1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it something like `vieurl` or `instaytdownload`
4. Keep it **Public** (or Private if you prefer)
5. Click **Create repository**

### Step 1.2: Push Your Code

Open a terminal in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - VieUrl video downloader"

# Add your GitHub repository as remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/vieurl.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend on Render (Django)

### Step 2.1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **Get Started for Free**
3. Sign up with your **GitHub account** (recommended for easy integration)

### Step 2.2: Create New Web Service

1. From the Render dashboard, click **New +** → **Web Service**
2. Connect your GitHub repository
3. Select your `vieurl` repository

### Step 2.3: Configure the Web Service

Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `vieurl-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn backend.wsgi:application` |

### Step 2.4: Set Environment Variables

Click on **Advanced** and add these environment variables:

| Key | Value |
|-----|-------|
| `DEBUG` | `False` |
| `DJANGO_SECRET_KEY` | Click "Generate" for a random value |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `PYTHON_VERSION` | `3.11.4` |

### Step 2.5: Deploy

1. Click **Create Web Service**
2. Wait for the build to complete (5-10 minutes first time)
3. Once deployed, you'll get a URL like: `https://vieurl-backend.onrender.com`

### Step 2.6: Verify Backend is Working

Visit: `https://vieurl-backend.onrender.com/api/` 
You should see the Django REST Framework interface or a response.

**⚠️ Note your Render backend URL - you'll need it for the frontend!**

---

## Part 3: Deploy Frontend on Vercel (Next.js)

### Step 3.1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Start Deploying**
3. Sign up with your **GitHub account**

### Step 3.2: Import Project

1. Click **Add New...** → **Project**
2. Import your GitHub repository
3. Select the `vieurl` repository

### Step 3.3: Configure Project

| Field | Value |
|-------|-------|
| **Framework Preset** | `Next.js` (should auto-detect) |
| **Root Directory** | `frontend` |

### Step 3.4: Add Environment Variables

In the **Environment Variables** section, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://vieurl-backend.onrender.com` |

**Replace with your actual Render backend URL from Step 2.5!**

### Step 3.5: Deploy

1. Click **Deploy**
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://vieurl.vercel.app`

---

## Part 4: Update CORS Settings (Important!)

After deployment, go back to your Render dashboard and update the CORS settings.

### Step 4.1: Update Django Settings

Add your Vercel frontend URL to allowed origins. You have two options:

**Option A: Add to Environment Variables on Render**

Add a new environment variable:
| Key | Value |
|-----|-------|
| `CORS_ALLOWED_ORIGINS` | `https://vieurl.vercel.app` |

**Option B: Keep CORS_ALLOW_ALL_ORIGINS = True** (already configured)

This is already set in your settings.py, so all origins are allowed.

---

## 🎉 Congratulations!

Your VieUrl application is now live! 

- **Frontend**: `https://vieurl.vercel.app` (or your custom domain)
- **Backend**: `https://vieurl-backend.onrender.com`

---

## 🔧 Troubleshooting

### Backend not responding?
- Check Render logs for errors
- Verify all environment variables are set correctly
- Make sure `build.sh` has Unix line endings (LF, not CRLF)

### Frontend can't connect to backend?
- Verify `NEXT_PUBLIC_API_URL` is set correctly on Vercel
- Check if CORS is properly configured
- Redeploy frontend after adding environment variables

### Downloads not working?
- Render's free tier has limited resources
- yt-dlp may need to be updated periodically
- Some videos may be geo-restricted

### Slow initial load?
- Render free tier spins down after inactivity
- First request may take 30-60 seconds to wake up

---

## 💡 Tips for Production

1. **Custom Domain**: Add your own domain in Vercel/Render settings
2. **HTTPS**: Both platforms provide free SSL certificates
3. **Upgrade Plans**: For better performance, consider paid tiers
4. **Monitoring**: Use Render's built-in logging and metrics

---

## 📁 Files Created for Deployment

| File | Purpose |
|------|---------|
| `backend/render.yaml` | Render configuration |
| `backend/build.sh` | Build script for Render |
| `backend/requirements.txt` | Python dependencies (updated) |
| `backend/backend/settings.py` | Django settings (updated for production) |
| `frontend/.env.local` | Local environment variables |
| `frontend/.env.example` | Example environment file |

---

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
