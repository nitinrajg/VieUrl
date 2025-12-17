#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install ffmpeg (required for yt-dlp)
apt-get update && apt-get install -y ffmpeg || echo "ffmpeg installation via apt failed, trying alternative..."

# Collect static files
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate
