'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await login(data);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#D9F7F4' }}>
      <Navbar />
      
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#4BC0C8' }}>
              🌟 Welcome Back
            </h1>
          </div>
          <h2 className="text-center text-2xl font-bold" style={{ color: '#5C6B73' }}>
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: '#5C6B73' }}>
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#4BC0C8' }}
            >
              Create one here
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 shadow-xl sm:rounded-xl sm:px-10" style={{ backgroundColor: '#FFFFFF' }}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {apiError && (
                <div className="border px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FFF3E0', borderColor: '#FFD166', color: '#5C6B73' }}>
                  {apiError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm transition-colors placeholder-gray-400 bg-white"
                    style={{ 
                      borderColor: '#D9F7F4', 
                      color: '#5C6B73'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                    onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="appearance-none block w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 sm:text-sm transition-colors placeholder-gray-400 bg-white"
                    style={{ 
                      borderColor: '#D9F7F4', 
                      color: '#5C6B73'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                    onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: '#5C6B73' }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: '#5C6B73' }} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#4BC0C8' }}>
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#4BC0C8' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In 🚀'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#D9F7F4' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white" style={{ color: '#5C6B73' }}>
                    Need admin access? 🔧
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="https://aezcrib.xyz/app/user/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center py-2 px-4 border rounded-lg shadow-sm text-sm font-medium transition-all hover:scale-105"
                  style={{ 
                    borderColor: '#D9F7F4', 
                    color: '#5C6B73', 
                    backgroundColor: '#FFFFFF' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4BC0C8';
                    e.currentTarget.style.backgroundColor = '#D9F7F4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D9F7F4';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  Access Site Admin Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

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