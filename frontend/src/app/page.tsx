'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BookOpen, Users, PenTool, ArrowRight, Play, Download, Star, Heart, Mail, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SafeImage from '@/components/SafeImage';

// TypeScript interface for worksheet data from Drupal API
interface WorksheetData {
  name: string;
  worksheet: string;
  description: string;
  image: string;
  level: string;
  price: string;
  subject: string;
}

// TypeScript interface for video data from Drupal API
interface VideoData {
  title: string;
  title_1: string;
  field_video_description: string;
  field_video_thumbnail: string;
  field_video_url: string;
  field_video_views: string;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [worksheets, setWorksheets] = useState<WorksheetData[]>([]);
  const [videos, setVideos] = useState<VideoData[]>([]); // Featured videos for carousel
  const [latestVideos, setLatestVideos] = useState<VideoData[]>([]); // All videos for latest section
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [latestVideosLoading, setLatestVideosLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [latestVideosError, setLatestVideosError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch worksheets from Drupal API
  useEffect(() => {
    const fetchWorksheets = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://aezcrib.xyz/app/api/json/worksheets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: WorksheetData[] = await response.json();
        setWorksheets(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching worksheets:', err);
        setError('Failed to load worksheets');
      } finally {
        setLoading(false);
      }
    };

    fetchWorksheets();
  }, []);

  // Fetch featured videos from Drupal API for "Watch Real Kids..." section
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const response = await fetch('https://aezcrib.xyz/app/api/json/videos-featured', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: VideoData[] = await response.json();
        setVideos(data);
        setVideosError(null);
      } catch (err) {
        console.error('Error fetching featured videos:', err);
        setVideosError('Failed to load featured videos');
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Fetch latest videos from Drupal API for "Latest Videos" section
  useEffect(() => {
    const fetchLatestVideos = async () => {
      try {
        setLatestVideosLoading(true);
        const response = await fetch('https://aezcrib.xyz/app/api/json/videos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: VideoData[] = await response.json();
        setLatestVideos(data);
        setLatestVideosError(null);
      } catch (err) {
        console.error('Error fetching latest videos:', err);
        setLatestVideosError('Failed to load latest videos');
      } finally {
        setLatestVideosLoading(false);
      }
    };

    fetchLatestVideos();
  }, []);

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to open video modal
  const openVideoModal = (video: VideoData) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Function to close video modal
  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsModalOpen(false);
    // Re-enable body scroll
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D9F7F4' }}>
      <Navbar />
      
      <main className="pt-16">
        {/* Header & Hero Section */}
        <section className="text-white py-20" style={{ background: 'linear-gradient(135deg, #4BC0C8 0%, #FFD166 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Large Friendly Logo */}
              <div className="mb-8">
                <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tight">
                  AezCrib
                </h1>
                <p className="text-xl md:text-2xl font-medium">
                  Where Learning Becomes an Adventure!
                </p>
              </div>
              
              {/* Hero Content */}
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Educational Worksheets That Make Kids Love Learning
                </h2>
                <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                  Our main goal is to help reduce screentime for kids especially during their formative years by providing printable and engaging offline activities.
                </p>
                
                {isAuthenticated ? (
                  <div className="backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <h3 className="text-2xl font-semibold mb-3">
                      Welcome back, {user?.name}! 👋
                    </h3>
                    <p className="mb-6 text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Ready to continue your learning journey?
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
                      style={{ backgroundColor: '#FFFFFF', color: '#4BC0C8', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    >
                      Continue Learning
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                      href="/register"
                      className="px-6 py-3 md:px-10 md:py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
                      style={{ backgroundColor: '#FFFFFF', color: '#4BC0C8', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    >
                      Start Transitioning Today! 🚀
                    </Link>
                    <Link
                      href="#showcase"
                      className="border-3 text-white px-6 py-3 md:px-10 md:py-5 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-800 transition-all"
                      style={{ borderColor: '#FFFFFF', borderWidth: '3px' }}
                    >
                      See It In Action ▶️
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Video Showcase Section */}
        <section id="showcase" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#5C6B73' }}>
                Watch Real Kids Love Learning! 📺
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: '#5C6B73' }}>
                See how our worksheets and activities transform screen time into meaningful learning moments.
                These are real families sharing their AezCrib journey!
              </p>
            </div>

            {/* Video Carousel */}
            <div className="relative max-w-4xl mx-auto">
                <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="relative">
                  {/* Video Thumbnail */}
                          <div className="aspect-video bg-gray-200 relative group cursor-pointer"
                       onClick={() => videos[currentVideoIndex] && openVideoModal(videos[currentVideoIndex])}>
                    {videos.length > 0 ? (
                      <>
                        {/* Image with explicit z-index */}
                        <SafeImage
                          src={`https://aezcrib.xyz${videos[currentVideoIndex]?.field_video_thumbnail}`}
                          alt={videos[currentVideoIndex]?.title}
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => {
                            // Keep same logging but SafeImage will handle fallback/hide
                            try { console.log('Thumbnail failed to load:', (e as any).currentTarget?.src); } catch {}
                            try { console.log('Original path:', videos[currentVideoIndex]?.field_video_thumbnail); } catch {}
                          }}
                          onLoad={() => {
                            try { console.log('Thumbnail loaded successfully:', videos[currentVideoIndex]?.field_video_thumbnail); } catch {}
                          }}
                        />
                        {/* Fallback gradient background */}
                        <div 
                          className="absolute inset-0 z-0"
                          style={{ background: 'linear-gradient(135deg, #4BC0C8 0%, #FFD166 100%)' }}
                        />
                        {/* Overlay that appears on hover - higher z-index */}
                        <div className="absolute inset-0 bg-transparent flex items-center justify-center transition-all duration-300 z-20">
                          <button 
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:scale-110" 
                            style={{ backgroundColor: '#FFD166' }}
                            aria-label="Play video"
                          >
                            <Play className="w-6 md:w-8 h-6 md:h-8 ml-1" style={{ color: '#5C6B73' }} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="w-12 h-12 mx-auto mb-4" style={{ color: '#5C6B73' }} />
                          <p style={{ color: '#5C6B73' }}>Loading videos...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={prevVideo}
                    aria-label="Previous video"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 z-30"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <ChevronLeft className="w-6 h-6" style={{ color: '#5C6B73' }} />
                  </button>
                  <button 
                    onClick={nextVideo}
                    aria-label="Next video"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 z-30"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <ChevronRight className="w-6 h-6" style={{ color: '#5C6B73' }} />
                  </button>
                </div>
                
                {/* Video Info */}
                <div className="p-6 md:p-8">
                              <h3 className="text-2xl font-bold mb-3" style={{ color: '#5C6B73' }}>
                    {videos.length > 0 ? videos[currentVideoIndex]?.title : 'Loading Videos...'}
                  </h3>
                  <p className="text-lg" style={{ color: '#5C6B73' }}>
                    {videos.length > 0 ? (
                      videos[currentVideoIndex]?.field_video_description.length > 120 
                        ? `${videos[currentVideoIndex]?.field_video_description.substring(0, 120)}...` 
                        : videos[currentVideoIndex]?.field_video_description
                    ) : 'Please wait while we load the latest educational videos...'}
                  </p>
                </div>
              </div>

              {/* Video Indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    aria-label={`Go to video ${index + 1}`}
                    className={`w-3 h-3 rounded-full transition-all p-2 md:p-0 ${
                      index === currentVideoIndex ? 'scale-125' : 'opacity-50 hover:opacity-75'
                    }`}
                    style={{ backgroundColor: '#4BC0C8' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Content Preview Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Featured Worksheets */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold mb-4" style={{ color: '#5C6B73' }}>
                    🎨 Popular Worksheets
                  </h2>
                  <p className="text-xl" style={{ color: '#5C6B73' }}>
                    Download and print these family favorites!
                  </p>
                </div>
                <Link 
                  href="/worksheets"
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                >
                  View All Worksheets
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-lg flex flex-col animate-pulse" style={{ backgroundColor: '#FFFFFF' }}>
                      <div className="aspect-[3/2] bg-gray-200"></div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                          <div className="w-12 h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="w-full h-16 bg-gray-200 rounded mb-4"></div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="w-20 h-4 bg-gray-200 rounded"></div>
                          <div className="w-20 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg" style={{ color: '#5C6B73' }}>
                      😔 {error}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                      style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : worksheets.length === 0 ? (
                  // No data state
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg" style={{ color: '#5C6B73' }}>
                      📚 No worksheets available at the moment
                    </p>
                  </div>
                ) : (
                  // Actual worksheet data
                  worksheets.map((worksheet, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
                      <div className="aspect-[3/2] bg-gray-200">
                        <SafeImage
                          src={`https://aezcrib.xyz${worksheet.image}`}
                          alt={worksheet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#D9F7F4', color: '#4BC0C8' }}>
                            {worksheet.level}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}>
                            {worksheet.subject}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#5C6B73' }}>
                          {worksheet.name}
                        </h3>
                        <p className="text-sm mb-4 flex-grow" style={{ color: '#5C6B73' }}>
                          {worksheet.description.length > 100 
                            ? `${worksheet.description.substring(0, 100)}...` 
                            : worksheet.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-sm" style={{ color: '#5C6B73' }}>
                            <SafeImage
                              src="https://aezcrib.xyz/app/sites/default/files/assets/aezcoins.png"
                              alt="AezCoins"
                              className="w-4 h-4 mr-1"
                              textFallback="Ac"
                            />
                            <span className="font-semibold">{worksheet.price}</span>
                          </div>
                          {parseFloat(worksheet.price) === 0 ? (
                            <a
                              href={`https://aezcrib.xyz${worksheet.worksheet}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                              style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                            >
                              Download
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                if (!isAuthenticated) {
                                  // Redirect to login if not authenticated
                                  window.location.href = '/login';
                                } else {
                                  // Handle purchase logic here
                                  toast('Purchase functionality coming soon!');
                                }
                              }}
                              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                              style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Featured Videos */}
            <div>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold mb-4" style={{ color: '#5C6B73' }}>
                    📹 Latest Videos
                  </h2>
                  <p className="text-xl" style={{ color: '#5C6B73' }}>
                    Learning tips, tutorials, and success stories!
                  </p>
                </div>
                <Link 
                  href="/videos"
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                >
                  Watch All Videos
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {latestVideosLoading ? (
                  // Loading skeleton for videos
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-lg animate-pulse" style={{ backgroundColor: '#FFFFFF' }}>
                      <div className="aspect-video bg-gray-200"></div>
                      <div className="p-6">
                        <div className="w-20 h-6 bg-gray-200 rounded-full mb-2"></div>
                        <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="w-full h-12 bg-gray-200 rounded mb-4"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : latestVideosError ? (
                  // Error state for videos
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg" style={{ color: '#5C6B73' }}>
                      😔 {latestVideosError}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                      style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : latestVideos.length === 0 ? (
                  // No data state for videos
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg" style={{ color: '#5C6B73' }}>
                      🎥 No videos available at the moment
                    </p>
                  </div>
                ) : (
                  // Actual video data
                  latestVideos.map((video, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
                      <div className="relative aspect-video bg-gray-200">
                        <SafeImage
                          src={`https://aezcrib.xyz${video.field_video_thumbnail}`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openVideoModal(video)}
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#FFD166' }}
                          >
                            <Play className="w-5 h-5 ml-0.5" style={{ color: '#5C6B73' }} />
                          </button>
                        </div>
                        {video.field_video_views && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#FFFFFF' }}>
                            {video.field_video_views} views
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#5C6B73' }}>
                          {video.title}
                        </h3>
                        <p className="text-sm mb-4 flex-grow" style={{ color: '#5C6B73' }}>
                          {video.field_video_description.length > 80 
                            ? `${video.field_video_description.substring(0, 80)}...` 
                            : video.field_video_description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-sm" style={{ color: '#5C6B73' }}>
                            {video.field_video_views && (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                {video.field_video_views} views
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => openVideoModal(video)}
                            className="px-3 py-1 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                            style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                          >
                            Watch Video
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        {!isAuthenticated && (
          <section className="py-20" style={{ backgroundColor: '#4BC0C8' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="rounded-2xl p-12" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to Transform Learning Time? 🌟
                </h2>
                <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                  Join parents who've discovered the joy of learning with AezCrib. 
                  Start your educational adventure today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/register"
                    className="px-10 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
                    style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                  >
                    Free Registration 🎉
                  </Link>
                  <Link
                    href="/worksheets"
                    className="border-3 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:bg-opacity-10 transition-all"
                    style={{ borderColor: '#FFFFFF', borderWidth: '2px' }}
                  >
                    Browse Worksheets
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Video Modal */}
      {isModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#FFFFFF' }}>
              <h3 className="text-xl font-bold" style={{ color: '#5C6B73' }}>
                {selectedVideo.title}
              </h3>
              <button
                onClick={closeVideoModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: '#5C6B73' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Video Content */}
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              {getYouTubeVideoId(selectedVideo.field_video_url) ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.field_video_url)}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <p className="text-lg mb-4" style={{ color: '#5C6B73' }}>
                      Video format not supported in modal
                    </p>
                    <a
                      href={selectedVideo.field_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                      style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                    >
                      Watch in New Tab
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Description */}
            <div className="p-6" style={{ backgroundColor: '#F8F9FA' }}>
              <p className="text-gray-700 leading-relaxed">
                {selectedVideo.field_video_description}
              </p>
              {selectedVideo.field_video_views && (
                <div className="mt-4 flex items-center text-sm" style={{ color: '#5C6B73' }}>
                  <Play className="w-4 h-4 mr-1" />
                  {selectedVideo.field_video_views} views
                </div>
              )}
            </div>
          </div>
          
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={closeVideoModal}
          ></div>
        </div>
      )}
    </div>
  );
}