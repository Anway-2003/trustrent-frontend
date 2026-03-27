'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, User, LogOut, Settings, Plus, Search, MessageCircle, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  
  // Navin State: Properties count thevnyasti
  const [activePropertiesCount, setActivePropertiesCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // Navin useEffect: Backend kadun properties ghenyasti
  useEffect(() => {
    if (user?.role === 'LANDLORD') {
      fetch('http://localhost:8080/api/properties')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((data) => {
          // Fakt "available: true" aslelya properties count kar
          const activeCount = data.filter((p: any) => p.available).length;
          setActivePropertiesCount(activeCount);
        })
        .catch((err) => console.error("Properties count fetch error:", err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isLandlord = user.role === 'LANDLORD';
  const isTenant = user.role === 'TENANT';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                    isLandlord ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {isLandlord ? (
                      <Home className="h-8 w-8 text-green-600" />
                    ) : (
                      <User className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Welcome, {user.firstName}!
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLandlord ? 'Manage your properties' : 'Find the perfect home'}
                    </dd>
                  </dl>
                </div>
                <div className="ml-5 flex-shrink-0">
                  {user.verified ? (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-sm text-green-600 font-medium">Verified</span>
                    </div>
                  ) : (
                    <span className="text-sm text-yellow-600 font-medium">Pending verification</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-6 sm:px-0">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLandlord ? (
              <>
                <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                      <Plus className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <Link href="/properties/new" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Add Property
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      List a new rental property
                    </p>
                  </div>
                </div>

                <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                      <Home className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <Link href="/my-properties" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        My Properties
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Manage existing properties
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                      <Search className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <Link href="/properties" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Search Homes
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Find the perfect home for you
                    </p>
                  </div>
                </div>

                <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                      <User className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <Link href="/landlords" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Find Landlords
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Discover verified landlords
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-600 ring-4 ring-white">
                  <MessageCircle className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <Link href="/messages" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Messages
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage conversations
                </p>
              </div>
            </div>

            <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-500 rounded-lg shadow hover:shadow-md transition-shadow">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-gray-50 text-gray-600 ring-4 ring-white">
                  <Settings className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <Link href="/profile" className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Profile
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Update your information
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-4 py-6 sm:px-0">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Overview
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Unread messages
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {isLandlord && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active properties
                        </dt>
                        {/* Ithe aapan dynamic count dakhvla ahe */}
                        <dd className="text-lg font-medium text-gray-900">{activePropertiesCount}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average rating
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">-</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}