'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen, Users, PenTool, Star, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent':
        return <Users className="h-8 w-8 text-green-600" />;
      case 'educator':
        return <BookOpen className="h-8 w-8 text-blue-600" />;
      case 'creator':
        return <PenTool className="h-8 w-8 text-purple-600" />;
      default:
        return <Users className="h-8 w-8 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'parent':
        return 'bg-green-100 text-green-800';
      case 'educator':
        return 'bg-blue-100 text-blue-800';
      case 'creator':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDashboardContent = () => {
    switch (user.role) {
      case 'parent':
        return {
          title: 'Parent Dashboard',
          subtitle: 'Track your child\'s learning progress and connect with educators',
          stats: [
            { label: 'Active Courses', value: '3', icon: BookOpen },
            { label: 'Progress', value: '75%', icon: TrendingUp },
            { label: 'This Week', value: '12h', icon: Calendar },
          ],
          quickActions: [
            { title: 'View Child\'s Progress', href: '#', description: 'See detailed learning analytics' },
            { title: 'Message Educators', href: '#', description: 'Connect with your child\'s teachers' },
            { title: 'Browse Resources', href: '#', description: 'Find educational materials' },
          ],
        };
      case 'educator':
        return {
          title: 'Educator Dashboard',
          subtitle: 'Manage your students and create engaging learning experiences',
          stats: [
            { label: 'Students', value: '24', icon: Users },
            { label: 'Courses', value: '5', icon: BookOpen },
            { label: 'Avg. Rating', value: '4.8', icon: Star },
          ],
          quickActions: [
            { title: 'Create Lesson', href: '#', description: 'Design new educational content' },
            { title: 'Student Management', href: '#', description: 'View and manage your students' },
            { title: 'Analytics', href: '#', description: 'Track student progress' },
          ],
        };
      case 'creator':
        return {
          title: 'Creator Dashboard',
          subtitle: 'Develop and monetize your educational content',
          stats: [
            { label: 'Published', value: '12', icon: BookOpen },
            { label: 'Revenue', value: '$2.4k', icon: TrendingUp },
            { label: 'Subscribers', value: '156', icon: Users },
          ],
          quickActions: [
            { title: 'Create Content', href: '#', description: 'Start building new educational material' },
            { title: 'Analytics', href: '#', description: 'View performance metrics' },
            { title: 'Revenue Report', href: '#', description: 'Track your earnings' },
          ],
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Welcome to your learning platform',
          stats: [],
          quickActions: [],
        };
    }
  };

  const dashboardContent = getDashboardContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getRoleIcon(user.role)}
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {dashboardContent.title}
                </h1>
                <p className="text-gray-600">{dashboardContent.subtitle}</p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-blue-100">
            Ready to continue your learning journey? Here's what's new since your last visit.
          </p>
        </div>

        {/* Stats */}
        {dashboardContent.stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {dashboardContent.stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.label}
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {dashboardContent.quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                More Features Coming Soon!
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  We're actively developing additional features for the dashboard. 
                  Content management, detailed analytics, and interactive tools are in progress.
                  The Drupal backend integration will enable full content creation and management capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}