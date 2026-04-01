'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Eye, EyeOff, User, Mail, Lock, Phone, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signIn } from 'next-auth/react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    role: '', phone: '', bio: '', city: '', region: '', country: 'India'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        setSuccessMsg('Account created successfully!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError('Registration failed.');
      }
    } catch (_err) { // Underscore to ignore unused variable
      setError('Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center text-2xl font-bold">
          <Home className="h-8 w-8 text-blue-600 mr-2" /> TrustRent
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">Create account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-10 shadow rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{successMsg}</div>}
            
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="role" value="TENANT" checked={formData.role === 'TENANT'} onChange={handleChange} className="sr-only" />
                <div className={`border-2 rounded-lg p-3 text-center ${formData.role === 'TENANT' ? 'border-blue-500 bg-blue-50' : ''}`}>Tenant</div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="LANDLORD" checked={formData.role === 'LANDLORD'} onChange={handleChange} className="sr-only" />
                <div className={`border-2 rounded-lg p-3 text-center ${formData.role === 'LANDLORD' ? 'border-green-500 bg-green-50' : ''}`}>Landlord</div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleChange} className="w-full border p-2 rounded-md" />
              <input name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleChange} className="w-full border p-2 rounded-md" />
            </div>

            <input name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleChange} className="w-full border p-2 rounded-md" />
            
            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" required value={formData.password} onChange={handleChange} className="w-full border p-2 rounded-md" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-md font-bold">
              {isLoading ? 'Registering...' : 'Sign up'}
            </button>
          </form>
          <div className="mt-6">
            <button onClick={() => signIn('google', { callbackUrl: '/login' })} className="w-full flex justify-center items-center border p-2 rounded-md">Sign up with Google</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() { return <Suspense fallback={<div>Loading...</div>}><RegisterForm /></Suspense>; }