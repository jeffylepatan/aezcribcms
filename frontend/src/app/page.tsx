'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { BookOpen, Users, PenTool, ArrowRight, Play, Download, Star, Heart, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [worksheets, setWorksheets] = useState<WorksheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Sample video data - replace with actual video URLs and data
  const videoShowcase = [
    {
      id: 1,
      title: "Learning Numbers with Fun Worksheets",
      caption: "Watch Alex master counting with our colorful number worksheets! 🎯",
      thumbnail: "/api/placeholder/400/300",
      videoUrl: "#"
    },
    {
      id: 2,
      title: "Creative Letter Tracing Adventure",
      caption: "See how Emma practices writing letters with our interactive activities! ✨",
      thumbnail: "/api/placeholder/400/300",
      videoUrl: "#"
    },
    {
      id: 3,
      title: "Science Experiments Made Simple",
      caption: "Join Jake as he explores amazing science experiments at home! 🔬",
      thumbnail: "/api/placeholder/400/300",
      videoUrl: "#"
    }
  ];

  // Sample video content data
  const featuredVideos = [
    {
      id: 1,
      title: "How to Use Number Worksheets",
      description: "Step-by-step guide for parents and educators",
      thumbnail: "/api/placeholder/300/200",
      duration: "5:32",
      views: 2840,
      category: "Tutorial"
    },
    {
      id: 2,
      title: "Creative Learning at Home",
      description: "Tips for making learning fun and engaging",
      thumbnail: "/api/placeholder/300/200",
      duration: "8:15",
      views: 1967,
      category: "Tips"
    },
    {
      id: 3,
      title: "Success Stories: Parent Reviews",
      description: "Real families share their AezCrib experience",
      thumbnail: "/api/placeholder/300/200",
      duration: "6:43",
      views: 1523,
      category: "Reviews"
    },
    {
      id: 4,
      title: "Educational Games & Activities",
      description: "Fun ways to extend worksheet learning",
      thumbnail: "/api/placeholder/300/200",
      duration: "7:28",
      views: 1205,
      category: "Activities"
    }
  ];

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoShowcase.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoShowcase.length) % videoShowcase.length);
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
                  🌟 AezCrib
                </h1>
                <p className="text-xl md:text-2xl font-medium">
                  Where Learning Becomes an Adventure!
                </p>
              </div>
              
              {/* Hero Content */}
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Educational Worksheets & Videos That Make Kids Love Learning
                </h2>
                <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                  Join thousands of families discovering the joy of learning with our carefully crafted 
                  worksheets, engaging videos, and proven educational activities.
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
                      className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
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
                      className="px-10 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
                      style={{ backgroundColor: '#FFFFFF', color: '#4BC0C8', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    >
                      Start Learning Today! 🚀
                    </Link>
                    <Link
                      href="#showcase"
                      className="border-3 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-all"
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
                  <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                    <img 
                      src={videoShowcase[currentVideoIndex].thumbnail} 
                      alt={videoShowcase[currentVideoIndex].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <button className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: '#FFD166' }}>
                        <Play className="w-8 h-8 ml-1" style={{ color: '#5C6B73' }} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={prevVideo}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <ChevronLeft className="w-6 h-6" style={{ color: '#5C6B73' }} />
                  </button>
                  <button 
                    onClick={nextVideo}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <ChevronRight className="w-6 h-6" style={{ color: '#5C6B73' }} />
                  </button>
                </div>
                
                {/* Video Info */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#5C6B73' }}>
                    {videoShowcase[currentVideoIndex].title}
                  </h3>
                  <p className="text-lg" style={{ color: '#5C6B73' }}>
                    {videoShowcase[currentVideoIndex].caption}
                  </p>
                </div>
              </div>

              {/* Video Indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {videoShowcase.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
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
                        <img 
                          src={`https://aezcrib.xyz${worksheet.image}`} 
                          alt={worksheet.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/300/200';
                          }}
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
                            <span className="font-semibold">${worksheet.price}</span>
                          </div>
                          <a
                            href={`https://aezcrib.xyz${worksheet.worksheet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                            style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                          >
                            Download
                          </a>
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
                {featuredVideos.map((video) => (
                  <div key={video.id} className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="relative aspect-video bg-gray-200">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFD166' }}>
                          <Play className="w-5 h-5 ml-0.5" style={{ color: '#5C6B73' }} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#FFFFFF' }}>
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#FFF3E0', color: '#FFD166' }}>
                          {video.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: '#5C6B73' }}>
                        {video.title}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: '#5C6B73' }}>
                        {video.description}
                      </p>
                      <div className="flex items-center text-sm" style={{ color: '#5C6B73' }}>
                        <Heart className="w-4 h-4 mr-1" />
                        {video.views.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                ))}
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
                  Join over 10,000 families who've discovered the joy of learning with AezCrib. 
                  Start your educational adventure today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/register"
                    className="px-10 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
                    style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                  >
                    Start Free Trial 🎉
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

      {/* Enhanced Footer */}
      <footer className="text-white py-16" style={{ backgroundColor: '#5C6B73' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            
            {/* Brand & About */}
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold mb-4">🌟 AezCrib</h3>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                We believe every child deserves engaging, high-quality educational content. 
                AezCrib transforms learning into an adventure, making education accessible, 
                fun, and effective for families worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <span className="text-xl">📚</span>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <span className="text-xl">🎯</span>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <span className="text-xl">❤️</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/worksheets" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Browse Worksheets</Link></li>
                <li><Link href="/videos" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Watch Videos</Link></li>
                <li><Link href="/pricing" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Pricing Plans</Link></li>
                <li><Link href="/support" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Help Center</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Contact Us</Link></li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-xl font-bold mb-4">Stay Updated! 📬</h4>
              <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Get weekly learning tips and new content alerts!
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#FFFFFF', boxShadow: '0 0 0 2px rgba(75, 192, 200, 0.3)' }}
                />
                <button className="w-full px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105" style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}>
                  Subscribe Free
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link href="/privacy" className="text-sm hover:opacity-80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Privacy Policy</Link>
              <Link href="/terms" className="text-sm hover:opacity-80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Terms of Service</Link>
              <Link href="/cookies" className="text-sm hover:opacity-80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Cookie Policy</Link>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              © 2025 AezCrib. Made with ❤️ for families everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}