'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { BookOpen, Users, PenTool, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to AezCrib
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Your premium learning platform connecting parents, educators, and creators
                in one collaborative space.
              </p>
              
              {isAuthenticated ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-2">
                    Welcome back, {user?.name}!
                  </h2>
                  <p className="text-blue-100 mb-4">
                    You're logged in as a {user?.role}
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Three Ways to Learn and Grow
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you're a parent supporting your child's education, an educator 
                sharing knowledge, or a creator developing content, we have you covered.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Parents */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Parents</h3>
                <p className="text-gray-600 mb-6">
                  Access curated educational content, track your child's progress, 
                  and connect with educators to support your family's learning journey.
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• Educational resource library</li>
                  <li>• Progress tracking tools</li>
                  <li>• Parent-educator communication</li>
                  <li>• Age-appropriate content</li>
                </ul>
              </div>

              {/* Educators */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Educators</h3>
                <p className="text-gray-600 mb-6">
                  Share your expertise, create engaging lessons, and build meaningful 
                  connections with students and parents in your educational community.
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• Lesson planning tools</li>
                  <li>• Student management</li>
                  <li>• Assessment creation</li>
                  <li>• Community collaboration</li>
                </ul>
              </div>

              {/* Creators */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PenTool className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Creators</h3>
                <p className="text-gray-600 mb-6">
                  Develop and monetize educational content, reach a targeted audience, 
                  and contribute to the future of digital learning experiences.
                </p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• Content creation tools</li>
                  <li>• Revenue opportunities</li>
                  <li>• Analytics dashboard</li>
                  <li>• Creator community</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="bg-gray-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Learning?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of parents, educators, and creators who are already 
                transforming education through our platform.
              </p>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">AezCrib</h3>
            <p className="text-gray-400 mb-4">
              Empowering education through technology and community.
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 AezCrib. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}