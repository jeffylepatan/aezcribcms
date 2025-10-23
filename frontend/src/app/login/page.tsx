'use client';

import { useState } from 'react';
// import { z } from 'zod';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver as zodRHResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const resetSchema = z.object({ email: z.string().email('Please enter a valid email address') });

type ResetFormData = z.infer<typeof resetSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useRHForm<ResetFormData>({
    resolver: zodRHResolver(resetSchema),
  });
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

  // Password reset handler
  const handlePasswordReset = async (data: ResetFormData) => {
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);
    try {
      // Drupal expects POST to /app/user/password with email
      const res = await fetch('https://aezcrib.xyz/app/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: data.email }),
      });
      if (res.ok) {
        setResetSuccess('If your email exists, you will receive a password reset link.');
        resetResetForm();
      } else {
        setResetError('Failed to send reset request. Please try again.');
      }
    } catch (err) {
      setResetError('Network error. Please try again.');
    } finally {
      setResetLoading(false);
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
                  <button
                    type="button"
                    className="font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#4BC0C8', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    onClick={() => setShowResetModal(true)}
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              {/* Password Reset Modal */}
              {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setShowResetModal(false);
                        setResetError(null);
                        setResetSuccess(null);
                        resetResetForm();
                      }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#4BC0C8' }}>Reset Password</h3>
                    <form onSubmit={handleResetSubmit(handlePasswordReset)} className="space-y-4">
                      <div>
                        <label htmlFor="resetEmail" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                          Enter your email address
                        </label>
                        <input
                          {...registerReset('email')}
                          id="resetEmail"
                          type="email"
                          className="appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm transition-colors placeholder-gray-400 bg-white"
                          style={{ borderColor: '#D9F7F4', color: '#5C6B73' }}
                          placeholder="your@email.com"
                        />
                        {resetErrors.email && (
                          <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{resetErrors.email.message}</p>
                        )}
                      </div>
                      {resetError && (
                        <p className="text-sm mb-2" style={{ color: '#FFD166' }}>{resetError}</p>
                      )}
                      {resetSuccess && (
                        <p className="text-sm mb-2" style={{ color: '#4BC0C8' }}>{resetSuccess}</p>
                      )}
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-2 px-4 rounded-md text-white font-semibold transition-all"
                        style={{ backgroundColor: '#4BC0C8' }}
                      >
                        {resetLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

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

      <Footer />
    </div>
  );
}