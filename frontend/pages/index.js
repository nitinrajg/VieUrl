// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Get API URL from environment variable (defaults to localhost for development)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [videoDetails, setVideoDetails] = useState(null);
  const [platform, setPlatform] = useState('youtube');
  const [gradientPosition, setGradientPosition] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Subtle gradient animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 300);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Pulsing glow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => {
        // Create a smooth sine wave between 0 and 1
        return Math.sin(Date.now() / 1000) * 0.5 + 0.5;
      });
    }, 16); // 60fps animation
    return () => clearInterval(interval);
  }, []);

  // Dynamic glow styles based on intensity
  const glowStyles = {
    opacity: 0.3 + glowIntensity * 0.4, // Opacity varies between 0.3 and 0.7
    transform: `scale(${1 + glowIntensity * 0.1})`, // Scale varies between 1 and 1.1
  };

  // Accent color for buttons and highlights
  const accentGradient = {
    background: `linear-gradient(${gradientPosition}deg, #8a2387, #e94057, #f27121)`,
    backgroundSize: '200% 200%',
  };

  // Keeping the original logic for functionality
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDownloadLink('');
    setVideoDetails(null);

    try {
      const response = await fetch(`${API_URL}/api/extract-info/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, platform }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video information');
      }

      setVideoDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (quality) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/download/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, platform, quality }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate download link');
      }

      setDownloadLink(data.download_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-black">
      <Head>
        <title>vieUrl | Download YouTube Videos</title>
        <meta name="description" content="Download high-quality videos from YouTube and Instagram with ease" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className="py-4 px-6 flex justify-between items-center bg-black">
        <div className="text-2xl font-bold">
          <span className="font-bold text-purple-500">vie</span>
          <span className="text-yellow-400">Url</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Home</a>
          <a href="#about" className="text-gray-300 hover:text-yellow-400 transition-colors">About Us</a>
          <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Contact</a>
          <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Install</a>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Download Youtube
            <br />
            Video by Link!
          </h1>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Unlimited Downloads</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Watermark</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>High Quality</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center bg-zinc-800 rounded-full overflow-hidden p-1 mb-8 w-full max-w-3xl mx-auto border border-zinc-700">
              <div className="flex-none pl-4 pr-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=YUEtgAPNV0w"
                className="flex-grow py-3 px-2 bg-transparent border-none focus:outline-none text-white"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex-none bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full transition-colors"
              >
                {isLoading ? 'Processing...' : 'Get Info'}
              </button>
            </div>
          </form>

          <div className="flex justify-center">
            <Link
              href="/instagram"
              className="flex items-center text-white font-medium py-3 px-6 rounded-full transition-colors bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Switch to Instagram Downloader
            </Link>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-900 border border-red-800 text-red-200 rounded-lg max-w-3xl mx-auto">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {videoDetails && (
            <div className="mt-6 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 max-w-3xl mx-auto">
              <div className="p-5">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/5">
                    <div className="relative pb-[56.25%] rounded-lg overflow-hidden bg-black">
                      <img
                        src={videoDetails.thumbnail}
                        alt="Video Thumbnail"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-3/5">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">{videoDetails.title}</h2>

                    <div className="space-y-2 mb-4">
                      {videoDetails.author && (
                        <p className="text-gray-300 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {videoDetails.author}
                        </p>
                      )}

                      {videoDetails.duration && (
                        <p className="text-gray-300 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {videoDetails.duration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-300">Download Options:</h3>
                      <div className="flex flex-wrap gap-2">
                        {videoDetails.formats.map((format) => (
                          <button
                            key={format.quality}
                            onClick={() => handleDownload(format.quality)}
                            className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
                            </svg>
                            {format.quality}
                            {format.extension && <span className="text-gray-400 ml-1">(.{format.extension})</span>}
                            {format.filesize > 0 && <span className="text-gray-400 ml-1">({format.filesize}MB)</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {downloadLink && (
            <div className="mt-6 p-5 bg-green-900 border border-green-800 text-green-200 rounded-lg max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mb-2 font-medium text-xl">Your video is ready!</p>
                <p className="mb-4 text-sm text-green-300">Tip: Right-click the button and select "Save link as..." to download</p>
                <a
                  href={downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Open Video / Download
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 mt-8">
          <div className="relative">
            {/* Multiple glowing layers with animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-yellow-500/30 blur-[100px] -z-10 transition-all duration-1000" style={glowStyles}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-yellow-400/40 blur-[50px] -z-10 scale-95 transition-all duration-1000" style={glowStyles}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-yellow-300/50 blur-[25px] -z-10 scale-90 transition-all duration-1000" style={glowStyles}></div>
            {/* Content container with glass effect */}
            <div className="relative z-0 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-800/50 shadow-[0_0_50px_-12px] shadow-purple-500/50">
              <p className="text-gray-200 text-lg">Experience seamless YouTube video downloads with our user-friendly tool.</p>
              <p className="text-gray-200 text-lg">Simply paste your link and get started!</p>
            </div>
          </div>
        </div>

        <section id="about" className="w-full max-w-4xl mx-auto mt-24 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">About vieUrl</h2>
            <div className="relative">
              {/* Multiple glowing layers with animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-yellow-500/30 blur-[100px] -z-10 transition-all duration-1000" style={glowStyles}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-yellow-400/40 blur-[50px] -z-10 scale-95 transition-all duration-1000" style={glowStyles}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-yellow-300/50 blur-[25px] -z-10 scale-90 transition-all duration-1000" style={glowStyles}></div>
              {/* Content container with glass effect */}
              <div className="relative z-0 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-800/50 shadow-[0_0_50px_-12px] shadow-purple-500/50">
                <p className="text-gray-300 mb-4">
                  vieUrl is your go-to platform for downloading high-quality videos from YouTube and Instagram. We've designed our service with simplicity and efficiency in mind, making it easier than ever to save your favorite content.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-purple-500 mb-3">
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                    <p className="text-gray-400 text-sm">Quick processing and download speeds for all your videos</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-yellow-400 mb-3">
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">High Quality</h3>
                    <p className="text-gray-400 text-sm">Download videos in the highest available quality</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-pink-500 mb-3">
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11zm8.921 2.012a1 1 0 01.831 1.145 19.86 19.86 0 01-.545 2.436 1 1 0 11-1.92-.558c.207-.713.371-1.445.49-2.192a1 1 0 011.144-.831z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Always Free</h3>
                    <p className="text-gray-400 text-sm">No hidden fees or subscriptions required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-4xl mx-auto mt-24 px-4 mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Contact</h2>
            <div className="relative">
              {/* Multiple glowing layers with animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-yellow-500/30 blur-[100px] -z-10 transition-all duration-1000" style={glowStyles}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-yellow-400/40 blur-[50px] -z-10 scale-95 transition-all duration-1000" style={glowStyles}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-yellow-300/50 blur-[25px] -z-10 scale-90 transition-all duration-1000" style={glowStyles}></div>
              {/* Content container with glass effect */}
              <div className="relative z-0 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-800/50 shadow-[0_0_50px_-12px] shadow-purple-500/50">
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Hi, I'm Nitin Raj, a beginner web developer and tech enthusiast eager to learn and explore the latest trends in web development. I enjoy building projects with Next.js, Tailwind CSS, and FastAPI while improving my skills in frontend and backend development. I'm always excited to take on new challenges, experiment with new technologies, and grow as a developer.
                </p>
                <div className="flex justify-center space-x-6">
                  <a
                    href="https://www.linkedin.com/in/vishwanath-nitin-raj-33b1022b9/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                      alt="LinkedIn"
                      className="w-8 h-8"
                    />
                  </a>
                  <a
                    href="https://github.com/nitinrajg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <img
                      src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                      alt="GitHub"
                      className="w-8 h-8"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}