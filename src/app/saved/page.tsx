'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Home, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface Property {
  id: string;
  title: string;
  city: string;
  region: string;
  monthlyRent: number;
  images: string[];
}

export default function SavedPropertiesPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API URL from environment variables
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trustrent-backend.onrender.com';

  // 1. Fetch Saved Properties from Backend
  const fetchSavedProperties = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}/favorites-details`);
      if (response.ok) {
        const data = await response.json();
        setSavedProperties(data);
      }
    } catch (err) {
      console.error('Error fetching saved properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, API_URL]);

  // 2. Auth Check
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  // 3. Load Data
  useEffect(() => {
    if (user?.id) {
      fetchSavedProperties();
    }
  }, [user?.id, fetchSavedProperties]);

  // Remove Favorite Function
  const removeFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to remove this from saved?")) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${user?.id}/favorites/${propertyId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-100 p-2 rounded-lg">
            <Heart className="h-6 w-6 text-red-600 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Saved Homes</h1>
        </div>

        {savedProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No properties saved yet</h2>
            <p className="text-gray-500 mt-2">Start exploring and save homes you like!</p>
            <Link href="/properties" className="mt-6 inline-flex items-center text-blue-600 font-medium hover:underline">
              Browse Properties <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                <Link href={`/properties/${property.id}`} className="block relative h-48">
                  {property.images && property.images.length > 0 ? (
                    <Image 
                      src={property.images[0]} 
                      alt={property.title} 
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Home className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <button 
                    onClick={(e) => removeFavorite(e, property.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>

                <div className="p-5">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                    {property.city}, {property.region}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 truncate">{property.title}</h3>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xl font-extrabold text-blue-600">
                      ₹{property.monthlyRent.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-gray-500"> /mo</span>
                    </span>
                    <Link href={`/properties/${property.id}`} className="text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}