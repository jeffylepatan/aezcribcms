'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  commerceService, 
  UserWorksheet, 
  Transaction as ApiTransaction, 
  Recommendation 
} from '@/services/commerceService';
import { 
  Coins, 
  Download, 
  History, 
  CreditCard, 
  FileText, 
  Calendar,
  Filter,
  Search,
  Star,
  TrendingUp,
  AlertCircle,
  Plus,
  BookOpen,
  Users,
  PenTool,
  LogOut
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [credits, setCredits] = useState(0);
  const [purchasedWorksheets, setPurchasedWorksheets] = useState<UserWorksheet[]>([]);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setError(null); // Clear any previous errors
      
      // Fetch user credits
      const creditsResponse = await commerceService.getCredits();
      if (creditsResponse.success) {
        setCredits(creditsResponse.credits);
      }

      // Fetch purchased worksheets
      const worksheetsResponse = await commerceService.getUserWorksheets();
      if (worksheetsResponse.success) {
        setPurchasedWorksheets(worksheetsResponse.worksheets);
      }

      // Fetch transaction history
      const transactionsResponse = await commerceService.getTransactions();
      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.transactions);
      }

      // Fetch recommendations
      const recommendationsResponse = await commerceService.getRecommendations();
      if (recommendationsResponse.success) {
        setRecommendations(recommendationsResponse.recommendations);
      }
      
      setDashboardLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      setDashboardLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleAddCredits = () => {
    // For now, we'll show an alert with instructions
    // In the future, this could open a modal or navigate to a donation page
    alert(`To add AezCoins:
    
1. Send money via GCash to [Your GCash Number]
2. Take a screenshot of the receipt
3. Contact support with your receipt
4. Credits will be added manually within 24 hours

Conversion Rate: ₱1 = 10 AezCoins`);
  };

  const handleDownloadWorksheet = async (worksheetId: number, title: string) => {
    try {
      const blob = await commerceService.downloadWorksheet(worksheetId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download worksheet. Please try again.');
    }
  };

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p style={{ color: '#5C6B73' }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Show error state if API connection failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">API Connection Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <p className="text-gray-600 mb-4">
              This usually means the Drupal commerce module isn't installed or accessible yet.
            </p>
            <button
              onClick={() => {
                setError(null);
                fetchDashboardData();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredWorksheets = purchasedWorksheets.filter(worksheet => {
    const matchesSearch = worksheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worksheet.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || worksheet.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  // Show role-based dashboard for non-parents, but focus on parent dashboard for now
  if (user.role !== 'parent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#4BC0C8' }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h1>
            <p className="text-lg mb-8" style={{ color: '#5C6B73' }}>
              Dashboard features for {user.role}s are coming soon!
            </p>
            <div 
              className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-8 border border-white/20 max-w-md mx-auto"
            >
              <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#4BC0C8' }} />
              <p style={{ color: '#5C6B73' }}>
                We're currently focusing on the parent experience. Additional features for educators and creators will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parent Dashboard - AezCoins & Worksheet Management
  // Helper for greeting name
  const greetingName = user?.firstName || user?.field_first_name
    ? `${user?.firstName || user?.field_first_name} ${user?.lastName || user?.field_last_name}`.trim()
    : user?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#4BC0C8' }}>
                Welcome back, {greetingName}! 🌟
              </h1>
              <p className="text-lg" style={{ color: '#5C6B73' }}>
                Manage your AezCoins and downloaded worksheets
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80 hover:scale-105"
              style={{ color: '#5C6B73', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217, 247, 244, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)')}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Credits Card */}
        <div className="mb-8">
          <div 
            className="rounded-xl shadow-lg p-6 backdrop-blur-sm border border-white/20"
            style={{ backgroundColor: 'rgba(75, 192, 200, 0.1)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: '#FFD166' }}
                >
                  <img
                    src="https://aezcrib.xyz/app/sites/default/files/assets/aezcoins.png"
                    alt="AezCoins"
                    className="h-8 w-8"
                    style={{ display: 'block' }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#4BC0C8' }}>
                    {credits.toLocaleString()} AezCoins
                  </h2>
                  <p className="text-sm" style={{ color: '#5C6B73' }}>
                    Available Balance
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddCredits}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Credits</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/worksheets"
              className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-full group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: 'rgba(75, 192, 200, 0.2)' }}
                >
                  <BookOpen className="h-6 w-6" style={{ color: '#4BC0C8' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#4BC0C8' }}>
                    Browse Worksheets
                  </h3>
                  <p className="text-sm" style={{ color: '#5C6B73', opacity: 0.8 }}>
                    Explore and purchase new worksheets
                  </p>
                </div>
              </div>
            </Link>

            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: 'rgba(255, 209, 102, 0.2)' }}
                >
                  <FileText className="h-6 w-6" style={{ color: '#FFD166' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#4BC0C8' }}>
                    My Library
                  </h3>
                  <p className="text-sm" style={{ color: '#5C6B73', opacity: 0.8 }}>
                    {purchasedWorksheets.length} purchased worksheets
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: 'rgba(92, 107, 115, 0.1)' }}
                >
                  <img
                    src="https://aezcrib.xyz/app/sites/default/files/assets/aezcoins.png"
                    alt="AezCoins"
                    className="h-6 w-6"
                    style={{ display: 'block' }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#4BC0C8' }}>
                    Total Spent
                  </h3>
                  <p className="text-sm" style={{ color: '#5C6B73', opacity: 0.8 }}>
                    {transactions
                      .filter(t => t.type === 'worksheet_purchase')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()} AezCoins
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/50 backdrop-blur-sm p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'worksheets', label: 'My Worksheets', icon: FileText },
              { id: 'history', label: 'Transaction History', icon: History },
              { id: 'recommendations', label: 'Recommended', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'shadow-md transform scale-105'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? '#4BC0C8' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : '#5C6B73'
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8" style={{ color: '#4BC0C8' }} />
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#5C6B73' }}>
                      {purchasedWorksheets.length}
                    </h3>
                    <p className="text-sm" style={{ color: '#5C6B73' }}>
                      Worksheets Owned
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8" style={{ color: '#4BC0C8' }} />
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#5C6B73' }}>
                      {purchasedWorksheets.filter(w => 
                        new Date(w.purchaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length}
                    </h3>
                    <p className="text-sm" style={{ color: '#5C6B73' }}>
                      This Month
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                    <img
                      src="https://aezcrib.xyz/app/sites/default/files/assets/aezcoins.png"
                      alt="AezCoins"
                      className="h-8 w-8"
                      style={{ display: 'block' }}
                    />
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#5C6B73' }}>
                      {transactions
                        .filter(t => t.type === 'worksheet_purchase')
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString()}
                    </h3>
                    <p className="text-sm" style={{ color: '#5C6B73' }}>
                      Total Spent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Worksheets Tab */}
          {activeTab === 'worksheets' && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-white/20">
              <div className="p-6 border-b border-gray-200/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h3 className="text-xl font-semibold" style={{ color: '#4BC0C8' }}>
                    My Worksheets ({purchasedWorksheets.length})
                  </h3>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#5C6B73' }} />
                      <input
                        type="text"
                        placeholder="Search worksheets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#4BC0C8', backgroundColor: '#FFFFFF', color: '#5C6B73' }}
                      />
                    </div>
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#4BC0C8', backgroundColor: '#FFFFFF', color: '#5C6B73' }}
                    >
                      <option value="all">All Subjects</option>
                      <option value="Math">Math</option>
                      <option value="English">English</option>
                      <option value="Science">Science</option>
                      <option value="Filipino">Filipino</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {filteredWorksheets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 mb-4" style={{ color: '#5C6B73', opacity: 0.5 }} />
                    <p className="text-lg mb-2" style={{ color: '#5C6B73' }}>
                      {searchTerm || filterSubject !== 'all' ? 'No worksheets match your filters' : 'No worksheets purchased yet'}
                    </p>
                    <p className="text-sm" style={{ color: '#5C6B73', opacity: 0.7 }}>
                      {searchTerm || filterSubject !== 'all' ? 'Try adjusting your search or filters' : 'Browse our worksheets to get started!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWorksheets.map((worksheet) => (
                      <div
                        key={worksheet.id}
                        className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1" style={{ color: '#5C6B73' }}>
                              {worksheet.title}
                            </h4>
                            <p className="text-sm mb-2" style={{ color: '#5C6B73', opacity: 0.7 }}>
                              {worksheet.subject} • {worksheet.gradeLevel}
                            </p>
                            <p className="text-xs" style={{ color: '#5C6B73', opacity: 0.5 }}>
                              Purchased: {new Date(worksheet.purchaseDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadWorksheet(worksheet.id, worksheet.title)}
                          className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:opacity-90 hover:scale-105"
                          style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                        >
                          <Download className="h-4 w-4" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-white/20">
              <div className="p-6 border-b border-gray-200/30">
                <h3 className="text-xl font-semibold" style={{ color: '#4BC0C8' }}>
                  Transaction History
                </h3>
              </div>
              <div className="p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 mb-4" style={{ color: '#5C6B73', opacity: 0.5 }} />
                    <p className="text-lg" style={{ color: '#5C6B73' }}>
                      No transactions yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="p-2 rounded-full"
                            style={{
                              backgroundColor: transaction.type === 'credit_purchase' ? '#FFD166' : '#4BC0C8',
                              opacity: 0.2
                            }}
                          >
                            {transaction.type === 'credit_purchase' ? 
                              <CreditCard className="h-4 w-4" style={{ color: '#5C6B73' }} /> :
                              <FileText className="h-4 w-4" style={{ color: '#5C6B73' }} />
                            }
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: '#5C6B73' }}>
                              {transaction.description}
                            </p>
                            <p className="text-sm" style={{ color: '#5C6B73', opacity: 0.7 }}>
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-medium"
                            style={{
                              color: transaction.type === 'credit_purchase' ? '#4BC0C8' : '#FF6B6B'
                            }}
                          >
                            {transaction.type === 'credit_purchase' ? '+' : '-'}{transaction.amount} AezCoins
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md border border-white/20">
              <div className="p-6 border-b border-gray-200/30">
                <h3 className="text-xl font-semibold" style={{ color: '#4BC0C8' }}>
                  Recommended for You
                </h3>
                <p className="text-sm mt-1" style={{ color: '#5C6B73', opacity: 0.7 }}>
                  Based on your purchase history and popular choices
                </p>
              </div>
              <div className="p-6">
                {recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="mx-auto h-12 w-12 mb-4" style={{ color: '#5C6B73', opacity: 0.5 }} />
                    <p className="text-lg" style={{ color: '#5C6B73' }}>
                      No recommendations available
                    </p>
                    <p className="text-sm" style={{ color: '#5C6B73', opacity: 0.7 }}>
                      Purchase some worksheets to get personalized recommendations!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((worksheet) => (
                      <div
                        key={worksheet.id}
                        className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1" style={{ color: '#5C6B73' }}>
                              {worksheet.title}
                            </h4>
                            <p className="text-sm mb-2" style={{ color: '#5C6B73', opacity: 0.7 }}>
                              {worksheet.subject} • {worksheet.gradeLevel}
                            </p>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < worksheet.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs" style={{ color: '#5C6B73', opacity: 0.5 }}>
                                Popular
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium" style={{ color: '#FFD166' }}>
                            {worksheet.price} AezCoins
                          </span>
                          <button
                            className="px-3 py-1 text-sm rounded-lg font-medium transition-all duration-300 hover:opacity-90"
                            style={{ backgroundColor: '#4BC0C8', color: '#FFFFFF' }}
                          >
                            Purchase
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Low Credits Alert */}
        {credits < 50 && credits > 0 && (
          <div 
            className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm"
            style={{ backgroundColor: '#FFD166' }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" style={{ color: '#5C6B73' }} />
              <div>
                <p className="font-medium text-sm" style={{ color: '#5C6B73' }}>
                  Low AezCoins Balance
                </p>
                <p className="text-xs" style={{ color: '#5C6B73', opacity: 0.8 }}>
                  Add more credits to continue purchasing worksheets
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}