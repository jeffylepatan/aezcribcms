'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, EyeOff, Loader2, Users } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number').regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['parent'], {
    message: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roles = [
  {
    value: 'parent',
    label: 'Parent',
    description: 'Support your child\'s educational journey with engaging worksheets and videos',
    icon: Users,
    color: 'green',
  },
] as const;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await registerUser(data);
      router.push('/dashboard');
    } catch (error: any) {
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = (color: string, selected: boolean) => {
    const baseClasses = "border-2 rounded-lg p-4 cursor-pointer transition-all";
    
    if (selected) {
      switch (color) {
        case 'green':
          return `${baseClasses} border-green-500 bg-green-50`;
        case 'blue':
          return `${baseClasses} border-blue-500 bg-blue-50`;
        case 'purple':
          return `${baseClasses} border-purple-500 bg-purple-50`;
        default:
          return `${baseClasses} border-gray-500 bg-gray-50`;
      }
    }
    
    return `${baseClasses} border-gray-200 hover:border-gray-300`;
  };

  const getIconClasses = (color: string, selected: boolean) => {
    if (selected) {
      switch (color) {
        case 'green':
          return 'text-green-600';
        case 'blue':
          return 'text-blue-600';
        case 'purple':
          return 'text-purple-600';
        default:
          return 'text-gray-600';
      }
    }
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#D9F7F4' }}>
      <Navbar />
      
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#4BC0C8' }}>
              🌟 Join AezCrib
            </h1>
          </div>
          <h2 className="text-center text-2xl font-bold" style={{ color: '#5C6B73' }}>
            Create your parent account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: '#5C6B73' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: '#4BC0C8' }}
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="py-8 px-4 shadow-xl sm:rounded-xl sm:px-10" style={{ backgroundColor: '#FFFFFF' }}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {apiError && (
                <div className="border px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FFF3E0', borderColor: '#FFD166', color: '#5C6B73' }}>
                  {apiError}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-4" style={{ color: '#5C6B73' }}>
                  Account Type
                </label>
                <div className="max-w-md mx-auto">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    
                    return (
                      <div key={role.value}>
                        <input
                          {...register('role')}
                          type="radio"
                          value={role.value}
                          id={role.value}
                          className="sr-only"
                          defaultChecked={true}
                        />
                        <label
                          htmlFor={role.value}
                          className="border-2 rounded-xl p-6 cursor-pointer transition-all hover:scale-105 block"
                          style={{ borderColor: '#4BC0C8', backgroundColor: '#D9F7F4' }}
                        >
                          <div className="flex flex-col items-center text-center">
                            <Icon className="h-10 w-10 mb-3" style={{ color: '#4BC0C8' }} />
                            <h3 className="font-bold text-lg" style={{ color: '#5C6B73' }}>{role.label}</h3>
                            <p className="text-sm mt-2" style={{ color: '#5C6B73' }}>{role.description}</p>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.role.message}</p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('firstName')}
                      type="text"
                      autoComplete="given-name"
                      className="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                      style={{ borderColor: '#D9F7F4', color: '#5C6B73' }}
                      placeholder="First name"
                      onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                      onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.firstName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('lastName')}
                      type="text"
                      autoComplete="family-name"
                      className="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                      style={{ borderColor: '#D9F7F4', color: '#5C6B73' }}
                      placeholder="Last name"
                      onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                      onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                    style={{ borderColor: '#D9F7F4', color: '#5C6B73' }}
                    placeholder="Enter your email"
                    onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                    onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                  Phone number
                </label>
                <div className="mt-1">
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    autoComplete="tel"
                    className="appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                    style={{ borderColor: '#D9F7F4', color: '#5C6B73' }}
                    placeholder="Enter your phone number"
                    onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                    onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="appearance-none block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                      style={{ borderColor: '#D9F7F4', color: '#5C6B73' }}
                      placeholder="Create password"
                      onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                      onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: '#5C6B73' }}>
                    Confirm password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="appearance-none block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
                      style={{ borderColor: '#D9F7F4', color: '#5C6B73' }}
                      placeholder="Confirm password"
                      onFocus={(e) => e.target.style.borderColor = '#4BC0C8'}
                      onBlur={(e) => e.target.style.borderColor = '#D9F7F4'}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" style={{ color: '#5C6B73' }} />
                      ) : (
                        <Eye className="h-5 w-5" style={{ color: '#5C6B73' }} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm" style={{ color: '#FFD166' }}>{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account ✨'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}