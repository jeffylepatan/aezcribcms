'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Play, Search, Filter, X, ArrowUpDown, Grid3X3, List, ExternalLink } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import SafeImage from '@/components/SafeImage';

// TypeScript interface for video data from Drupal API
interface VideoData {
  title: string;
  videoDescription: string;
  videoThumbnail: string;
  videoUrl: string;
  videoViews: string;
  relatedWorksheets: string;
}

export default function VideosPage() {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedVideoType, setSelectedVideoType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort states
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Layout state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal state
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch videos from Drupal API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://aezcrib.xyz/app/api/json/videos-all', {
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
        setError(null);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Get unique values for filters (video types based on URL or title patterns)
  const uniqueVideoTypes = useMemo(() => {
    const types = videos.map(video => {
      // Categorize based on URL or title patterns
      if (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) {
        return 'YouTube';
      } else if (video.videoUrl.includes('vimeo.com')) {
        return 'Vimeo';
      } else if (video.videoUrl.includes('.mp4') || video.videoUrl.includes('.webm')) {
        return 'Direct Video';
      } else {
        return 'Other';
      }
    });
    return [...new Set(types)].sort();
  }, [videos]);

  // Filter videos based on search and filters, then sort
  const filteredVideos = useMemo(() => {
    let filtered = videos.filter(video => {
      // Keyword search
      const matchesSearch = searchKeyword === '' || 
        video.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        video.videoDescription.toLowerCase().includes(searchKeyword.toLowerCase());

      // Video type filter
      const videoType = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') 
        ? 'YouTube' 
        : video.videoUrl.includes('vimeo.com') 
        ? 'Vimeo' 
        : video.videoUrl.includes('.mp4') || video.videoUrl.includes('.webm')
        ? 'Direct Video'
        : 'Other';
      
      const matchesType = selectedVideoType === '' || videoType === selectedVideoType;

      return matchesSearch && matchesType;
    });

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'views':
            const viewsA = parseInt(a.videoViews) || 0;
            const viewsB = parseInt(b.videoViews) || 0;
            comparison = viewsA - viewsB;
            break;
          case 'description':
            comparison = a.videoDescription.localeCompare(b.videoDescription);
            break;
          default:
            return 0;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [videos, searchKeyword, selectedVideoType, sortBy, sortOrder]);

  // Clear all filters and sorting
  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedVideoType('');
    setSortBy('');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchKeyword || selectedVideoType || sortBy;

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
    document.body.style.overflow = 'hidden';
  };

  // Function to close video modal
  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D9F7F4' }}>
      <Navbar />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #4BC0C8 0%, #FFD166 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Educational Videos
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Watch engaging educational content that makes learning fun and interactive for kids of all ages.
              </p>
              <div className="text-lg">
                <span className="bg-white bg-opacity-90 px-4 py-2 rounded-full font-semibold shadow-md" style={{ color: '#2D3748' }}>
                  {loading ? 'Loading...' : `${filteredVideos.length} videos available`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters Section */}
        <section className="py-8 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#5C6B73' }} />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:border-blue-400 text-gray-900 placeholder-gray-600"
                  style={{ borderColor: '#4BC0C8', backgroundColor: '#FFFFFF' }}
                />
              </div>
              
              <div className="flex gap-3">
                {/* View Mode Toggle */}
                <div className="flex rounded-xl overflow-hidden shadow-md border-2" style={{ borderColor: '#4BC0C8' }}>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-3 transition-all ${viewMode === 'cards' ? 'text-white' : 'text-gray-600 bg-white hover:bg-gray-50'}`}
                    style={{ backgroundColor: viewMode === 'cards' ? '#4BC0C8' : undefined }}
                    title="Card View"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-3 transition-all ${viewMode === 'table' ? 'text-white' : 'text-gray-600 bg-white hover:bg-gray-50'}`}
                    style={{ backgroundColor: viewMode === 'table' ? '#4BC0C8' : undefined }}
                    title="Table View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field || '');
                      setSortOrder(order as 'asc' | 'desc' || 'asc');
                    }}
                    className="appearance-none flex items-center px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-md text-gray-900 bg-white border-2 min-w-[160px]"
                    style={{ borderColor: '#4BC0C8' }}
                  >
                    <option value="">Default Order</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                    <option value="views-desc">Most Views</option>
                    <option value="views-asc">Least Views</option>
                    <option value="description-asc">Description A-Z</option>
                    <option value="description-desc">Description Z-A</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#5C6B73' }} />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-md"
                  style={{ backgroundColor: '#FFD166', color: '#2D3748' }}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters {hasActiveFilters && `(${[searchKeyword, selectedVideoType, sortBy].filter(Boolean).length})`}
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#2D3748' }}>
                    Filter Videos
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center text-sm px-3 py-1 rounded-lg transition-all hover:scale-105"
                      style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Video Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                      Video Type
                    </label>
                    <select
                      value={selectedVideoType}
                      onChange={(e) => setSelectedVideoType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400 text-gray-900 bg-white"
                      style={{ borderColor: '#4BC0C8' }}
                    >
                      <option value="">All Types</option>
                      {uniqueVideoTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchKeyword && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: '#E6FFFA', color: '#0B7285', border: '1px solid #B2F5EA' }}>
                    Search: "{searchKeyword}"
                    <button onClick={() => setSearchKeyword('')} className="ml-2 hover:bg-teal-200 rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {selectedVideoType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: '#E6FFFA', color: '#0B7285', border: '1px solid #B2F5EA' }}>
                    Type: {selectedVideoType}
                    <button onClick={() => setSelectedVideoType('')} className="ml-2 hover:bg-teal-200 rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {sortBy && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                    Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                    <button onClick={() => { setSortBy(''); setSortOrder('asc'); }} className="ml-2 hover:bg-yellow-200 rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Videos Grid/Table Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {viewMode === 'cards' ? (
              /* Card Layout */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                  // Loading skeleton for cards
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-lg flex flex-col animate-pulse" style={{ backgroundColor: '#FFFFFF' }}>
                      <div className="aspect-video bg-gray-200"></div>
                      <div className="p-6 flex flex-col flex-grow">
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
                    <p className="text-lg mb-4" style={{ color: '#2D3748' }}>
                      😔 {error}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md"
                      style={{ backgroundColor: '#FFD166', color: '#2D3748' }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredVideos.length === 0 ? (
                  // No results state
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg mb-4" style={{ color: '#2D3748' }}>
                      {hasActiveFilters ? '🔍 No videos match your current filters' : '🎥 No videos available at the moment'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md"
                        style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  // Actual video cards
                  filteredVideos.map((video, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
                      <div className="relative aspect-video bg-gray-200">
                        <SafeImage
                          src={`https://aezcrib.xyz${video.videoThumbnail}`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openVideoModal(video)}
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#FFD166' }}
                          >
                            <Play className="w-8 h-8 ml-1" style={{ color: '#5C6B73' }} />
                          </button>
                        </div>
                        {video.videoViews && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#FFFFFF' }}>
                            {video.videoViews} views
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#5C6B73' }}>
                          {video.title}
                        </h3>
                        <p className="text-sm mb-4 flex-grow" style={{ color: '#5C6B73' }}>
                          {video.videoDescription.length > 100 
                            ? `${video.videoDescription.substring(0, 100)}...` 
                            : video.videoDescription}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-sm" style={{ color: '#5C6B73' }}>
                            {video.videoViews && (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                {video.videoViews} views
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openVideoModal(video)}
                              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
                              style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                            >
                              Watch
                            </button>
                            <a
                              href={video.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 flex items-center"
                              style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Table Layout */
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                  // Loading skeleton for table
                  <div className="p-8">
                    <div className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded mb-4"></div>
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  // Error state
                  <div className="text-center py-12">
                    <p className="text-lg mb-4" style={{ color: '#2D3748' }}>
                      😔 {error}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md"
                      style={{ backgroundColor: '#FFD166', color: '#2D3748' }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredVideos.length === 0 ? (
                  // No results state
                  <div className="text-center py-12">
                    <p className="text-lg mb-4" style={{ color: '#2D3748' }}>
                      {hasActiveFilters ? '🔍 No videos match your current filters' : '🎥 No videos available at the moment'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md"
                        style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  // Actual table
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: '#F7FAFC' }}>
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Preview</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Title</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Description</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Views</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVideos.map((video, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#E2E8F0' }}>
                            <td className="px-6 py-4">
                              <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden relative">
                                <SafeImage
                                  src={`https://aezcrib.xyz${video.videoThumbnail}`}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-white opacity-80" />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <h4 className="font-semibold text-sm" style={{ color: '#1A202C' }}>
                                {video.title}
                              </h4>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs" style={{ color: '#4A5568' }}>
                                {video.videoDescription.length > 80 
                                  ? `${video.videoDescription.substring(0, 80)}...` 
                                  : video.videoDescription}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: '#5C6B73' }}>
                                {video.videoViews || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openVideoModal(video)}
                                  className="px-3 py-1 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                                  style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                                >
                                  Watch
                                </button>
                                <a
                                  href={video.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded-lg font-semibold text-xs transition-all hover:scale-105 flex items-center"
                                  style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
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
              {getYouTubeVideoId(selectedVideo.videoUrl) ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.videoUrl)}?autoplay=1`}
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
                      href={selectedVideo.videoUrl}
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
                {selectedVideo.videoDescription}
              </p>
              {selectedVideo.videoViews && (
                <div className="mt-4 flex items-center text-sm" style={{ color: '#5C6B73' }}>
                  <Play className="w-4 h-4 mr-1" />
                  {selectedVideo.videoViews} views
                </div>
              )}
              {selectedVideo.relatedWorksheets && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2" style={{ color: '#5C6B73' }}>
                    Related Worksheets:
                  </h4>
                  <p className="text-sm" style={{ color: '#5C6B73' }}>
                    {selectedVideo.relatedWorksheets}
                  </p>
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