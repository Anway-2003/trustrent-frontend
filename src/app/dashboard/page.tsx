'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, User, Settings, Plus, Search, MessageCircle, 
  Star, Building, CheckCircle2, MapPin, ExternalLink, Activity, Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  
  // Real Data States
  const [properties, setProperties] = useState<any[]>([]); // Landlord sathi
  const [savedProperties, setSavedProperties] = useState<any[]>([]); // Tenant sathi
  const [stats, setStats] = useState({ total: 0, active: 0, rented: 0 });
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // Data Fetching Logic (Role Pramane Veg-vegli API call)
  useEffect(() => {
    if (!user?.id) return;

    if (user.role === 'LANDLORD') {
      // 🏘️ LANDLORD: Tyachya swatahcya properties ghene
      setIsFetching(true);
      fetch(`http://localhost:8080/api/properties/owner/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((data) => {
          const sortedData = data.reverse();
          setProperties(sortedData);
          
          const activeCount = sortedData.filter((p: any) => p.available).length;
          setStats({
            total: sortedData.length,
            active: activeCount,
            rented: sortedData.length - activeCount
          });
        })
        .catch((err) => console.error("Properties fetch error:", err))
        .finally(() => setIsFetching(false));

    } else if (user.role === 'TENANT') {
      // 💖 TENANT: Tyanchya saved (favorite) properties ghene
      setIsFetching(true);
      fetch(`http://localhost:8080/api/users/${user.id}/favorites-details?t=${new Date().getTime()}`)
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((data) => {
          setSavedProperties(data.reverse()); // Navin save kelele aadhi dakhvnyasti
        })
        .catch((err) => console.error("Saved properties fetch error:", err))
        .finally(() => setIsFetching(false));
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isLandlord = user.role === 'LANDLORD';
  const isTenant = user.role === 'TENANT';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center">
              
              {/* 👈 FIX: Profile Pic dakhvnyacha logic add kela */}
              <div className="flex-shrink-0">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center overflow-hidden shadow-sm border-2 border-white ${
                  !user.avatar ? (isLandlord ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600') : 'bg-gray-100'
                }`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    isLandlord ? <Building className="h-10 w-10" /> : <User className="h-10 w-10" />
                  )}
                </div>
              </div>

              <div className="ml-6 flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.firstName}! 👋
                </h2>
                <p className="text-gray-500 mt-1">
                  {isLandlord ? 'Manage your properties and track your rental business.' : 'Find the perfect home and manage your saved properties.'}
                </p>
              </div>
              <div className="ml-6 flex-shrink-0 hidden md:block">
                {user.verified ? (
                  <div className="flex items-center bg-green-50 px-4 py-2 rounded-full border border-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-green-700 font-bold">Verified Account</span>
                  </div>
                ) : (
                  <Link href="/profile" className="flex items-center bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100 hover:bg-yellow-100 transition-colors">
                    <Activity className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-700 font-bold">Complete Profile</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 REAL STATS OVERVIEW (Landlord Only) */}
        {isLandlord && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" /> Business Overview
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isFetching ? '...' : stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="bg-green-50 rounded-lg p-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">Active (Available)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isFetching ? '...' : stats.active}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Home className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">Rented Out</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isFetching ? '...' : stats.rented}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions (Takes 1 column on large screens) */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-gray-100">
                
                {isLandlord ? (
                  <>
                    <Link href="/add-property" className="p-4 flex items-center hover:bg-gray-50 transition-colors group">
                      <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Plus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900">List New Property</p>
                        <p className="text-xs text-gray-500">Add a new home for rent</p>
                      </div>
                    </Link>
                    <Link href="/my-properties" className="p-4 flex items-center hover:bg-gray-50 transition-colors group">
                      <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors">
                        <Building className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900">Manage Properties</p>
                        <p className="text-xs text-gray-500">Edit or update listings</p>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/properties" className="p-4 flex items-center hover:bg-gray-50 transition-colors group">
                      <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Search className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900">Search Homes</p>
                        <p className="text-xs text-gray-500">Find your dream rental</p>
                      </div>
                    </Link>
                    <Link href="/saved" className="p-4 flex items-center hover:bg-gray-50 transition-colors group">
                      <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-100 transition-colors">
                        <Heart className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900">Saved Properties</p>
                        <p className="text-xs text-gray-500">View your wishlist</p>
                      </div>
                    </Link>
                  </>
                )}

                <Link href="/profile" className="p-4 flex items-center hover:bg-gray-50 transition-colors group">
                  <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-gray-900">Profile Settings</p>
                    <p className="text-xs text-gray-500">Update personal info</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 🌟 REAL LIST (Takes 2 columns) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isLandlord ? 'Recent Properties' : 'Your Saved Homes'}
              </h3>
              
              {isLandlord && properties.length > 0 && (
                <Link href="/my-properties" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  View All &rarr;
                </Link>
              )}
              {isTenant && savedProperties.length > 0 && (
                <Link href="/saved" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  View All &rarr;
                </Link>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {isFetching ? (
                <div className="p-8 text-center text-gray-500">Loading your data...</div>
              ) : isLandlord && properties.length > 0 ? (
                
                // ==========================
                // 🏠 LANDLORD PROPERTIES 
                // ==========================
                <ul className="divide-y divide-gray-100">
                  {properties.slice(0, 3).map((property) => (
                    <li key={property.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {property.images && property.images.length > 0 ? (
                            <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                          ) : (
                            <Home className="h-8 w-8 text-gray-400 m-auto mt-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{property.title}</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500 truncate">{property.city}, {property.region}</p>
                          </div>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${
                              property.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {property.available ? 'Available' : 'Rented'}
                            </span>
                            <span className="text-xs font-bold text-blue-600">{formatPrice(property.monthlyRent)}/mo</span>
                          </div>
                        </div>
                        <div>
                           <Link href={`/properties/${property.id}`} className="text-gray-400 hover:text-blue-600">
                              <ExternalLink className="h-5 w-5" />
                           </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

              ) : isLandlord ? (
                <div className="p-10 text-center">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-4">You haven't listed any properties yet.</p>
                  <Link href="/add-property" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> List Your First Property
                  </Link>
                </div>
                
              ) : isTenant && savedProperties.length > 0 ? (
                
                // ==========================
                // 💖 TENANT SAVED PROPERTIES 
                // ==========================
                <ul className="divide-y divide-gray-100">
                  {savedProperties.slice(0, 3).map((property) => (
                    <li key={property.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {property.images && property.images.length > 0 ? (
                            <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                          ) : (
                            <Home className="h-8 w-8 text-gray-400 m-auto mt-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{property.title}</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500 truncate">{property.city}, {property.region}</p>
                          </div>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${
                              property.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {property.available ? 'Available' : 'Rented'}
                            </span>
                            <span className="text-xs font-bold text-blue-600">{formatPrice(property.monthlyRent)}/mo</span>
                          </div>
                        </div>
                        <div>
                           <Link href={`/properties/${property.id}`} className="p-2 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 inline-flex items-center">
                              <span className="text-xs font-bold">View</span>
                           </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

              ) : (
                
                // ==========================
                // 🤷‍♂️ TENANT NO SAVED PROPERTIES
                // ==========================
                <div className="p-10 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-1">Your wishlist is empty.</p>
                  <p className="text-gray-400 text-sm mb-4 italic">"Come on bro, search for some houses and save them!" 🏠❤️</p>
                  <Link href="/properties" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" /> Start Exploring
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}