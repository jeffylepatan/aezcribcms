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
    <div className="min-h-screen" style={{ backgroundColor: '#D9F7F4' }}>
      <Navbar />
      
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: '#5C6B73' }}>
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: '#5C6B73' }}>
            Or{' '}
            <Link
              href="/register"
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#4BC0C8' }}
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10" style={{ backgroundColor: '#FFFFFF' }}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {apiError && (
                <div className="border px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FFE6E6', borderColor: '#FF6B6B', color: '#D32F2F' }}>
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
                    className="appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm transition-colors"
                    style={{ 
                      borderColor: '#5C6B73', 
                      backgroundColor: '#FFFFFF', 
                      color: '#5C6B73'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4BC0C8';
                      e.target.style.boxShadow = '0 0 0 2px rgba(75, 192, 200, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#5C6B73';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm" style={{ color: '#D32F2F' }}>{errors.email.message}</p>
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
                    className="appearance-none block w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 sm:text-sm transition-colors"
                    style={{ 
                      borderColor: '#5C6B73', 
                      backgroundColor: '#FFFFFF', 
                      color: '#5C6B73'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4BC0C8';
                      e.target.style.boxShadow = '0 0 0 2px rgba(75, 192, 200, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#5C6B73';
                      e.target.style.boxShadow = 'none';
                    }}
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
                  <p className="mt-1 text-sm" style={{ color: '#D32F2F' }}>{errors.password.message}</p>
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
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ 
                    backgroundColor: '#4BC0C8',
                    boxShadow: '0 0 0 2px rgba(75, 192, 200, 0.2)'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#5C6B73' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white" style={{ color: '#5C6B73' }}>
                    Need access to Drupal admin?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="https://aezcrib.xyz/app/user/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors hover:opacity-90"
                  style={{ 
                    borderColor: '#5C6B73', 
                    color: '#5C6B73', 
                    backgroundColor: '#FFFFFF' 
                  }}
                >
                  Access Drupal Admin Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}