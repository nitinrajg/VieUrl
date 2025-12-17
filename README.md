# InstaYTDownload

## Project Idea
InstaYTDownload is a web application that allows users to download videos from Instagram and YouTube easily. The frontend provides a simple interface for users to input video URLs, while the backend handles the actual downloading and processing of the videos.

## Frameworks & Technologies Used

### Frontend
- **Next.js** (v15.3.1): React framework for server-side rendering and static site generation
- **React** (v19)
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: For making HTTP requests
- **FFmpeg**: For video processing

### Backend
- **Django** (>=4.2): Python web framework
- **Django REST Framework**: For building RESTful APIs
- **django-cors-headers**: To handle CORS
- **yt-dlp**: For downloading YouTube videos
- **pytube**: Another library for YouTube video downloads
- **requests**: For making HTTP requests
- **beautifulsoup4**: For parsing HTML
- **ffmpeg-python**: For video processing

## How It Works
1. The user enters a video URL (Instagram or YouTube) in the frontend interface.
2. The frontend sends a request to the backend API with the video URL.
3. The backend processes the URL, downloads the video using yt-dlp or pytube, and processes it with FFmpeg if needed.
4. The processed video is sent back to the frontend for the user to download.

## Getting Started

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the Django server: `python manage.py runserver`

## License
This project is for educational purposes only.