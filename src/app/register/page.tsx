'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, User, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signIn } from 'next-auth/react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    role: 'TENANT', phone: '', bio: '', city: '', region: '', country: 'India'
  });

  useEffect(() => {
    const role = searchParams?.get('role') || '';
    if (role) {
      setFormData(prev => ({ ...prev, role: role.toUpperCase() }));
    }
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [authLoading, isLoggedIn, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trustrent-backend.onrender.com';
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: formData.role.toUpperCase() }),
      });

      if (response.ok) {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError('Registration failed. Email might already exist.');
      }
    } catch {
      setError('Connection error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Trust<span className="text-blue-600">Rent</span>
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm font-medium">{error}</div>}
            {successMsg && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md text-sm font-medium">{successMsg}</div>}
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <label className="cursor-pointer">
                <input type="radio" name="role" value="TENANT" checked={formData.role === 'TENANT'} onChange={handleChange} className="sr-only" />
                <div className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${formData.role === 'TENANT' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                  <User className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-sm">Tenant</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="LANDLORD" checked={formData.role === 'LANDLORD'} onChange={handleChange} className="sr-only" />
                <div className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${formData.role === 'LANDLORD' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                  <Building className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-sm">Landlord</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm" placeholder="Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm" placeholder="you@example.com" />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input name="confirmPassword" type={showPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm pr-10" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6">
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => signIn('google', { callbackUrl: '/login' })} 
                className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() { 
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <RegisterForm />
    </Suspense>
  ); 
}