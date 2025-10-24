"use client";
import { commerceService, CreditResponse } from '@/services/commerceService';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Search, Filter, X, ArrowUpDown, Grid3X3, List } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

// TypeScript interface for worksheet data from Drupal API
interface WorksheetData {
  name: string;
  worksheet: string;
  description: string;
  image: string;
  level: string;
  price: string;
  subject: string;
  worksheetId: string;
}

export default function WorksheetsPage() {
  // Credits state
  const { isAuthenticated } = useAuth();
  const [worksheets, setWorksheets] = useState<WorksheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort states
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Layout state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Fetch worksheets from Drupal API
  useEffect(() => {
    const fetchWorksheets = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://aezcrib.xyz/app/api/json/worksheets-all', {
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

  // Get unique values for filters
  const uniqueSubjects = useMemo(() => {
    const subjects = worksheets.map(worksheet => worksheet.subject).filter(Boolean);
    return [...new Set(subjects)].sort();
  }, [worksheets]);

  const uniqueLevels = useMemo(() => {
    const levels = worksheets.map(worksheet => worksheet.level).filter(Boolean);
    return [...new Set(levels)].sort();
  }, [worksheets]);

  // Filter worksheets based on search and filters, then sort
  const filteredWorksheets = useMemo(() => {
    let filtered = worksheets.filter(worksheet => {
      // Keyword search
      const matchesSearch = searchKeyword === '' || 
        worksheet.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        worksheet.description.toLowerCase().includes(searchKeyword.toLowerCase());

      // Subject filter
      const matchesSubject = selectedSubject === '' || worksheet.subject === selectedSubject;

      // Level filter
      const matchesLevel = selectedLevel === '' || worksheet.level === selectedLevel;

      // Price filter
      const worksheetPrice = parseFloat(worksheet.price);
      const matchesPrice = selectedPriceFilter === '' || 
        (selectedPriceFilter === 'free' && worksheetPrice === 0) ||
        (selectedPriceFilter === 'paid' && worksheetPrice > 0);

      return matchesSearch && matchesSubject && matchesLevel && matchesPrice;
    });

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'subject':
            comparison = a.subject.localeCompare(b.subject);
            break;
          case 'level':
            comparison = a.level.localeCompare(b.level);
            break;
          case 'price':
            const priceA = parseFloat(a.price);
            const priceB = parseFloat(b.price);
            comparison = priceA - priceB;
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          default:
            return 0;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [worksheets, searchKeyword, selectedSubject, selectedLevel, selectedPriceFilter, sortBy, sortOrder]);

  // Clear all filters and sorting
  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedSubject('');
    setSelectedLevel('');
    setSelectedPriceFilter('');
    setSortBy('');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchKeyword || selectedSubject || selectedLevel || selectedPriceFilter || sortBy;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D9F7F4' }}>
      <Navbar />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #4BC0C8 0%, #FFD166 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Educational Worksheets
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Discover our comprehensive collection of printable worksheets designed to make learning fun and engaging for kids of all ages.
              </p>
              <div className="text-lg">
                <span className="bg-white bg-opacity-90 px-4 py-2 rounded-full font-semibold shadow-md" style={{ color: '#2D3748' }}>
                  {loading ? 'Loading...' : `${filteredWorksheets.length} worksheets available`}
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
                  placeholder="Search worksheets..."
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
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="subject-asc">Subject A-Z</option>
                    <option value="subject-desc">Subject Z-A</option>
                    <option value="level-asc">Level A-Z</option>
                    <option value="level-desc">Level Z-A</option>
                    <option value="price-asc">Price Low-High</option>
                    <option value="price-desc">Price High-Low</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#5C6B73' }} />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-md"
                  style={{ backgroundColor: '#FFD166', color: '#2D3748' }}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters {hasActiveFilters && `(${[searchKeyword, selectedSubject, selectedLevel, selectedPriceFilter, sortBy].filter(Boolean).length})`}
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#2D3748' }}>
                    Filter Worksheets
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

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Subject Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400 text-gray-900 bg-white"
                      style={{ borderColor: '#4BC0C8' }}
                    >
                      <option value="">All Subjects</option>
                      {uniqueSubjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                      Level
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400 text-gray-900 bg-white"
                      style={{ borderColor: '#4BC0C8' }}
                    >
                      <option value="">All Levels</option>
                      {uniqueLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                      Price
                    </label>
                    <select
                      value={selectedPriceFilter}
                      onChange={(e) => setSelectedPriceFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400 text-gray-900 bg-white"
                      style={{ borderColor: '#4BC0C8' }}
                    >
                      <option value="">All Prices</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
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
                {selectedSubject && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: '#E6FFFA', color: '#0B7285', border: '1px solid #B2F5EA' }}>
                    Subject: {selectedSubject}
                    <button onClick={() => setSelectedSubject('')} className="ml-2 hover:bg-teal-200 rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {selectedLevel && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: '#E6FFFA', color: '#0B7285', border: '1px solid #B2F5EA' }}>
                    Level: {selectedLevel}
                    <button onClick={() => setSelectedLevel('')} className="ml-2 hover:bg-teal-200 rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {selectedPriceFilter && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm" style={{ backgroundColor: '#E6FFFA', color: '#0B7285', border: '1px solid #B2F5EA' }}>
                    Price: {selectedPriceFilter === 'free' ? 'Free' : 'Paid'}
                    <button onClick={() => setSelectedPriceFilter('')} className="ml-2 hover:bg-teal-200 rounded-full p-1">
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

        {/* Worksheets Grid/Table Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {viewMode === 'cards' ? (
              /* Card Layout */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                  // Loading skeleton for cards
                  Array.from({ length: 8 }).map((_, index) => (
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
                ) : filteredWorksheets.length === 0 ? (
                  // No results state
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg mb-4" style={{ color: '#2D3748' }}>
                      {hasActiveFilters ? '🔍 No worksheets match your current filters' : '📚 No worksheets available at the moment'}
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
                  // Actual worksheet cards
                  filteredWorksheets.map((worksheet, index) => (
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
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#E6FFFA', color: '#0B7285', border: '1px solid #B2F5EA' }}>
                            {worksheet.level}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                            {worksheet.subject}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#1A202C' }}>
                          {worksheet.name}
                        </h3>
                        <p className="text-sm mb-4 flex-grow" style={{ color: '#4A5568' }}>
                          {worksheet.description.length > 120 
                            ? `${worksheet.description.substring(0, 120)}...` 
                            : worksheet.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-sm" style={{ color: '#2D3748' }}>
                            <img 
                              src="https://aezcrib.xyz/app/sites/default/files/assets/aezcoins.png" 
                              alt="AezCoins" 
                              className="w-4 h-4 mr-1"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('span');
                                  fallback.textContent = '$';
                                  fallback.className = 'font-semibold';
                                  parent.insertBefore(fallback, e.currentTarget);
                                }
                              }}
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
                              onClick={async () => {
                                if (!isAuthenticated) {
                                  window.location.href = '/login';
                                  return;
                                }
                                try {
                                  // Fetch current user credits
                                  const creditsData = await commerceService.getCredits();
                                  const userCredits = creditsData.credits ?? 0;
                                  const worksheetPrice = parseFloat(worksheet.price);
                                  console.log('User Credits:', userCredits);
                                  console.log('Worksheet Price:', worksheetPrice);
                                  if (userCredits < worksheetPrice) {
                                    alert('Insufficient AezCoins. Please add more credits to purchase this worksheet.');
                                    return;
                                  }
                                  // Call purchase API
                                  const purchaseRes = await commerceService.purchaseWorksheet(parseInt(worksheet.worksheetId, 10));
                                  // Ensure the response is valid JSON and handle errors gracefully
                                  const purchaseData = await purchaseRes.json().catch((err) => {
                                    console.error('Error parsing purchase response JSON:', err);
                                    throw new Error('Invalid response from server. Please try again.');
                                  });
                                  if (!purchaseData.success) {
                                    // Log the server's response JSON for debugging
                                    const responseJson = await purchaseRes.json();
                                    console.error('Purchase API Response:', responseJson);
                                    alert(`Purchase failed: ${responseJson.error || 'Unknown error'}`);
                                    return;
                                  }
                                  // Deduct credits and update worksheet ownership (handled by backend)
                                  alert('Purchase successful! The worksheet has been added to your library and your credits have been updated.');
                                  window.location.reload();
                                } catch (err) {
                                  alert('An error occurred during purchase. Please try again.');
                                }
                              }}
                              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-md"
                              style={{ backgroundColor: '#FFD166', color: '#2D3748' }}
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
                ) : filteredWorksheets.length === 0 ? (
                  // No results state
                  <div className="text-center py-12">
                    <p className="text-lg mb-4" style={{ color: '#2D3748' }}>
                      {hasActiveFilters ? '🔍 No worksheets match your current filters' : '📚 No worksheets available at the moment'}
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
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Subject</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Level</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Price</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#2D3748' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWorksheets.map((worksheet, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#E2E8F0' }}>
                            <td className="px-6 py-4">
                              <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                                <img 
                                  src={`https://aezcrib.xyz${worksheet.image}`} 
                                  alt={worksheet.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/64/48';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-1" style={{ color: '#1A202C' }}>
                                  {worksheet.name}
                                </h4>
                                <p className="text-xs" style={{ color: '#4A5568' }}>
                                  {worksheet.description.length > 80 
                                    ? `${worksheet.description.substring(0, 80)}...` 
                                    : worksheet.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                                {worksheet.subject}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E6FFFA', color: '#0B7285', border: '1px solid #B2F5EA' }}>
                                {worksheet.level}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-sm" style={{ color: '#2D3748' }}>
                                <img 
                                  src="https://aezcrib.xyz/app/sites/default/files/assets/aezcoins.png" 
                                  alt="AezCoins" 
                                  className="w-4 h-4 mr-1"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      const fallback = document.createElement('span');
                                      fallback.textContent = '$';
                                      fallback.className = 'font-semibold';
                                      parent.insertBefore(fallback, e.currentTarget);
                                    }
                                  }}
                                />
                                <span className="font-semibold">{worksheet.price}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {parseFloat(worksheet.price) === 0 ? (
                                <a
                                  href={`https://aezcrib.xyz${worksheet.worksheet}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                                  style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                                >
                                  Download
                                </a>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      window.location.href = '/login';
                                    } else {
                                      alert('Purchase functionality coming soon!');
                                    }
                                  }}
                                  className="px-3 py-1 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                                  style={{ backgroundColor: '#FFD166', color: '#2D3748' }}
                                >
                                  Buy
                                </button>
                              )}
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
    </div>
  );
}