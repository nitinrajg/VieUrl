# VieUrl - Video Downloader

A full-stack application for downloading videos from various platforms. Built with Django REST Framework and Next.js.

## Project Structure

```
./
├── backend/     # Django REST API
└── frontend/    # Next.js frontend
```

## Deployment Guide

### Backend Deployment (Render)

1. Create a new Web Service on Render
   - Connect your GitHub repository
   - Select the branch to deploy
   - Choose "Python" as the environment

2. Configure the following settings:
   - Build Command: `./build.sh`
   - Start Command: `gunicorn backend.wsgi:application`
   - Root Directory: `backend`

3. Add environment variables:
   ```
   DJANGO_SECRET_KEY=your-secret-key
   PYTHON_VERSION=3.10.0
   DJANGO_SETTINGS_MODULE=backend.settings_prod
   ```

4. Deploy the application
   - Render will automatically run the build script
   - Handle database migrations
   - Collect static files

### Frontend Deployment (Vercel)

1. Create a new project on Vercel
   - Import your GitHub repository
   - Set the root directory to `frontend`

2. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `next build`
   - Output Directory: `.next`

3. Environment variables are automatically set through vercel.json

4. Deploy the application
   - Vercel will automatically build and deploy your frontend

## Local Development

### Backend Setup

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Start development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

Visit http://localhost:3000 to view the application.