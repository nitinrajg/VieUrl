import os
import re
import uuid
import tempfile
from django.conf import settings
from django.http import FileResponse
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pytube
import requests
import json
from bs4 import BeautifulSoup
from .models import VideoDownload
import yt_dlp

class ExtractVideoInfoView(APIView):
    def post(self, request):
        try:
            url = request.data.get('url')
            if not url:
                return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)

            if 'instagram.com' in url:
                return self.extract_instagram_info(url)
            else:
                return self.extract_youtube_info(url)
        except Exception as e:
            print(f"Error: {str(e)}")
            return Response({'error': 'Failed to process video'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def extract_youtube_info(self, url):
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
                'merge_output_format': 'mp4',
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    raise Exception("Could not get video info")
                
                formats = []
                available_formats = info.get('formats', [])
                if not available_formats:
                    raise Exception("No video formats available")
                
                # Only include MP4 formats
                for f in available_formats:
                    if f.get('ext') == 'mp4' and f.get('vcodec') != 'none':
                        quality = f.get('format_note', '')
                        # Only add formats with valid quality labels
                        if quality and quality.lower() in ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']:
                            try:
                                filesize = f.get('filesize')
                                if filesize is not None:
                                    filesize = round(float(filesize) / (1024 * 1024), 2)
                                else:
                                    filesize = 0
                            except (ValueError, TypeError):
                                filesize = 0
                                
                            formats.append({
                                'quality': quality,
                                'type': 'video',
                                'filesize': filesize,
                                'format_id': f.get('format_id', ''),
                                'extension': 'mp4',  # Always MP4 as we're filtering for it
                                'height': f.get('height', '')
                            })
                
                if not formats:
                    raise Exception("No compatible MP4 formats found")
                
                # Sort formats by quality (height)
                try:
                    formats.sort(key=lambda x: int(x['quality'][:-1]) if x['quality'][:-1].isdigit() else 0)
                except (ValueError, TypeError, KeyError):
                    # If sorting fails, keep the original order
                    pass
                
                video_info = {
                    'title': info.get('title', 'Untitled'),
                    'thumbnail': info.get('thumbnail'),
                    'duration': info.get('duration'),
                    'author': info.get('uploader', 'Unknown'),
                    'formats': formats
                }
                return Response(video_info)
        except Exception as e:
            raise Exception(f"Error extracting YouTube video info: {str(e)}")
    
    def extract_instagram_info(self, url):
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'format': 'best',
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    raise Exception("Could not get video info")

                if 'entries' in info:
                    info = info['entries'][0]
                
                formats = [{
                    'quality': 'Download',
                    'type': 'video',
                    'filesize': round(float(info.get('filesize', 0)) / (1024 * 1024), 2),
                    'url': info.get('url')
                }]
                
                video_info = {
                    'title': info.get('title', info.get('fulltitle', 'Instagram Video')),
                    'thumbnail': info.get('thumbnail'),
                    'author': info.get('uploader'),
                    'duration': info.get('duration'),
                    'formats': formats,
                    'is_instagram': True
                }
                return Response(video_info)
        except Exception as e:
            print(f"Instagram Error: {str(e)}")
            return Response({'error': 'Failed to extract Instagram video info'}, status=status.HTTP_400_BAD_REQUEST)

class DownloadVideoView(APIView):
    def post(self, request):
        try:
            url = request.data.get('url')
            quality = request.data.get('quality', '720p')
            if not url:
                return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if 'instagram.com' in url:
                return self.download_instagram_video(url)
            else:
                return self.download_youtube_video(url, quality)
        except Exception as e:
            print(f"Error: {str(e)}")
            return Response({'error': 'Failed to process video'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def download_instagram_video(self, url):
        try:
            ydl_opts = {
                'format': 'best',
                'quiet': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    raise Exception("Could not get video info")
                
                if 'entries' in info:
                    info = info['entries'][0]
                
                download_url = info.get('url')
                if not download_url:
                    raise Exception("Could not get download URL")
                
                return Response({
                    'download_url': download_url,
                    'title': info.get('title', info.get('fulltitle', 'Instagram Video')),
                    'quality': 'original',
                    'filesize': round(float(info.get('filesize', 0)) / (1024 * 1024), 2),
                    'is_instagram': True
                })
        except Exception as e:
            print(f"Instagram Download Error: {str(e)}")
            return Response({'error': f'Failed to get Instagram video URL: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    def download_youtube_video(self, url, quality):
        try:
            # Format string to strictly get MP4 format and avoid HLS/m3u8 streams
            format_str = (
                f'bestvideo[height<={quality[:-1]}][ext=mp4][protocol!*=dash][protocol!*=m3u8]+'
                f'bestaudio[ext=m4a]/best[height<={quality[:-1]}][ext=mp4][protocol!*=dash][protocol!*=m3u8]'
            )
            
            ydl_opts = {
                'format': format_str,
                'merge_output_format': 'mp4',
                'quiet': True,
                'no_warnings': True,
                # Force generic extractor to avoid m3u8 streams
                'extract_flat': True,
                'format_sort': ['res:' + quality[:-1], 'ext:mp4:m4a'],
                'format_sort_force': True,
                'postprocessors': [{
                    'key': 'FFmpegVideoConvertor',
                    'preferedformat': 'mp4',
                }],
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    raise Exception("Failed to get video info")
                
                # Get all available formats
                formats = info.get('formats', [])
                if not formats:
                    raise Exception("No formats available")
                
                # Strictly filter for MP4 formats and exclude m3u8/HLS streams
                mp4_formats = [
                    f for f in formats 
                    if f.get('ext') == 'mp4' 
                    and not f.get('protocol', '').startswith('m3u8') 
                    and not f.get('protocol', '').startswith('http_dash_segments')
                    and f.get('vcodec') != 'none'
                ]
                
                if not mp4_formats:
                    raise Exception("No MP4 format available")
                
                # Sort formats by height in descending order
                mp4_formats.sort(key=lambda x: x.get('height', 0), reverse=True)
                
                # Select the best format that matches our quality requirement
                target_height = int(quality[:-1])
                selected_format = None
                
                # First try to find exact match or closest lower quality
                for fmt in mp4_formats:
                    height = fmt.get('height', 0)
                    if height and height <= target_height:
                        selected_format = fmt
                        break
                
                # If no suitable format found, use the highest quality MP4 available
                if not selected_format and mp4_formats:
                    selected_format = mp4_formats[0]
                
                if not selected_format:
                    raise Exception("Could not find suitable MP4 format")
                
                # Verify the URL is not an m3u8 stream
                download_url = selected_format.get('url', '')
                if '.m3u8' in download_url or 'manifest' in download_url:
                    raise Exception("Only m3u8 stream available, MP4 download not possible")
                
                filesize = selected_format.get('filesize')
                filesize = round(float(filesize) / (1024 * 1024), 2) if filesize else None
                
                return Response({
                    'download_url': download_url,
                    'title': info.get('title', ''),
                    'quality': f"{selected_format.get('height', '')}p",
                    'filesize': filesize,
                    'format': 'mp4',
                    'extension': 'mp4'
                })
        except Exception as e:
            print(f"YouTube Download Error: {str(e)}")
            return Response({'error': 'Failed to get YouTube video URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
