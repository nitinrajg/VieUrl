import os
import re
import uuid
import tempfile
import base64
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


def get_youtube_cookie_path():
    """
    Decode Base64 encoded YouTube cookies from environment variable
    and write to a temporary file. Returns the path to the temp file.
    """
    encoded_cookies = os.environ.get('YOUTUBE_COOKIES_B64')
    
    if not encoded_cookies:
        print("COOKIE DEBUG: YOUTUBE_COOKIES_B64 environment variable is NOT set or empty")
        return None
    
    print(f"COOKIE DEBUG: Found YOUTUBE_COOKIES_B64, length: {len(encoded_cookies)} chars")
    
    try:
        # Create a temp file that persists until manually deleted
        with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.txt') as f:
            # Decode base64 string back to bytes and write to file
            decoded_bytes = base64.b64decode(encoded_cookies)
            f.write(decoded_bytes)
            print(f"COOKIE DEBUG: Created cookie file at {f.name}, size: {len(decoded_bytes)} bytes")
            # Print first 100 chars of decoded content for debugging
            try:
                decoded_str = decoded_bytes.decode('utf-8', errors='ignore')[:200]
                print(f"COOKIE DEBUG: Cookie file starts with: {decoded_str[:100]}...")
            except:
                pass
            return f.name
    except Exception as e:
        print(f"COOKIE DEBUG ERROR: Failed to process cookies: {e}")
        return None


def cleanup_cookie_file(cookie_path):
    """Remove the temporary cookie file"""
    if cookie_path and os.path.exists(cookie_path):
        try:
            os.remove(cookie_path)
        except Exception as e:
            print(f"Error cleaning up cookie file: {e}")

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
        cookie_path = None
        try:
            # Get cookie file path from Base64 encoded env var
            cookie_path = get_youtube_cookie_path()
            
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'ignoreerrors': False,
                # Don't specify format - let yt-dlp extract all available formats
            }
            
            # Add cookie file if available
            if cookie_path:
                ydl_opts['cookiefile'] = cookie_path
                print(f"COOKIE DEBUG: Using cookie file: {cookie_path}")
            else:
                print("COOKIE DEBUG: No cookie file available, proceeding without cookies")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    raise Exception("Could not get video info")
                
                formats = []
                available_formats = info.get('formats', [])
                if not available_formats:
                    raise Exception("No video formats available")
                
                # Include all video formats (not just MP4) with fallback options
                seen_qualities = set()
                for f in available_formats:
                    if f.get('vcodec') != 'none':  # Exclude audio-only formats
                        height = f.get('height')
                        if height:
                            quality = f"{height}p"
                        else:
                            quality = f.get('format_note', f.get('quality', 'unknown'))
                        
                        # Avoid duplicate qualities
                        if quality in seen_qualities:
                            continue
                        seen_qualities.add(quality)
                        
                        try:
                            filesize = f.get('filesize')
                            if filesize is not None:
                                filesize = round(float(filesize) / (1024 * 1024), 2)
                            else:
                                filesize = 0
                        except (ValueError, TypeError):
                            filesize = 0
                            
                        # Determine the best extension to use
                        ext = f.get('ext', 'mp4')
                        if ext not in ['mp4', 'webm', 'mkv']:
                            ext = 'mp4'  # Default to mp4 for unknown formats
                            
                        formats.append({
                            'quality': quality,
                            'type': 'video',
                            'filesize': filesize,
                            'format_id': f.get('format_id', ''),
                            'extension': ext,
                            'height': height or 0
                        })
                
                if not formats:
                    # If no video formats found, try to get at least one format
                    best_format = info.get('format_id')
                    if best_format:
                        formats.append({
                            'quality': 'best',
                            'type': 'video',
                            'filesize': 0,
                            'format_id': best_format,
                            'extension': info.get('ext', 'mp4'),
                            'height': info.get('height', 0)
                        })
                    else:
                        raise Exception("No video formats found")
                
                # Sort formats by quality (height)
                try:
                    formats.sort(key=lambda x: x.get('height', 0) if isinstance(x.get('height'), int) else 0, reverse=True)
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
        finally:
            # Always cleanup the cookie file
            cleanup_cookie_file(cookie_path)
    
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
        cookie_path = None
        try:
            # Get cookie file path from Base64 encoded env var
            cookie_path = get_youtube_cookie_path()
            
            # Try multiple format options in order of preference
            format_options = [
                f'best[height<={quality[:-1]}]',
                'best'
            ]
            
            selected_format = None
            info = None
            
            for format_str in format_options:
                try:
                    ydl_opts = {
                        'format': format_str,
                        'quiet': True,
                        'no_warnings': True,
                    }
                    
                    # Add cookie file if available
                    if cookie_path:
                        ydl_opts['cookiefile'] = cookie_path
                    
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info(url, download=False)
                        if info:
                            # Check if we have a valid format
                            if 'url' in info or (info.get('formats') and len(info['formats']) > 0):
                                break
                except Exception as e:
                    print(f"Format {format_str} failed: {e}")
                    continue
            
            if not info:
                raise Exception("Failed to get video info with any format")
            
            # If info contains direct URL, use it
            if 'url' in info:
                download_url = info['url']
                extension = info.get('ext', 'mp4')
                filesize = info.get('filesize')
                height = info.get('height', 0)
            else:
                # Get the best available format
                formats = info.get('formats', [])
                if not formats:
                    raise Exception("No formats available")
                
                # Try to find the best suitable format
                target_height = int(quality[:-1]) if quality.endswith('p') and quality[:-1].isdigit() else 720
                
                # Filter and sort formats
                video_formats = [
                    f for f in formats 
                    if f.get('vcodec') != 'none' and f.get('url')
                ]
                
                if not video_formats:
                    raise Exception("No video formats available")
                
                # Sort by preference: mp4 first, then by height
                def format_priority(fmt):
                    ext_score = 10 if fmt.get('ext') == 'mp4' else 5 if fmt.get('ext') in ['webm', 'mkv'] else 1
                    height_score = fmt.get('height', 0)
                    return (ext_score, height_score)
                
                video_formats.sort(key=format_priority, reverse=True)
                
                # Find best format within target height
                selected_format = None
                for fmt in video_formats:
                    height = fmt.get('height', 0)
                    if height <= target_height:
                        selected_format = fmt
                        break
                
                # If no format found within target, use the best available
                if not selected_format:
                    selected_format = video_formats[0]
                
                download_url = selected_format['url']
                extension = selected_format.get('ext', 'mp4')
                filesize = selected_format.get('filesize')
                height = selected_format.get('height', 0)
            
            # Prepare filesize
            filesize_mb = round(float(filesize) / (1024 * 1024), 2) if filesize else None
            
            return Response({
                'download_url': download_url,
                'title': info.get('title', 'Video'),
                'quality': f"{height}p" if height else 'unknown',
                'filesize': filesize_mb,
                'format': extension,
                'extension': extension
            })
        except Exception as e:
            print(f"YouTube Download Error: {str(e)}")
            return Response({'error': 'Failed to get YouTube video URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Always cleanup the cookie file
            cleanup_cookie_file(cookie_path)

