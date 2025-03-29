from .settings import *
import os

DEBUG = False

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'https://*.vercel.app',  # Allow Vercel domains
    'http://localhost:3000',  # For local development
]
CORS_ALLOW_CREDENTIALS = True

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use SQLite database for free deployment
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Allowed hosts
ALLOWED_HOSTS = [
    '.onrender.com',  # Allow all subdomains on render.com
    'localhost',
    '127.0.0.1',
    'your-domain.com',  # Replace with your domain
]

# Additional security headers
SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': f'max-age={SECURE_HSTS_SECONDS}; includeSubDomains',
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:;"
}