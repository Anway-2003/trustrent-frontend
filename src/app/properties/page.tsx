'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Home, SlidersHorizontal, Heart, BadgeCheck } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';

interface Property {
  id: string;
  title: string;
  type: string;
  city: string;
  region: string;
  monthlyRent: number;
  available: boolean;
  images: string[];
  ownerVerified?: boolean; // 👇 NAVIN ADD KELA
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');
  const [maxRent, setMaxRent] = useState<number>(200000);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    let result = properties;

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(lowercasedSearch) ||
        p.city?.toLowerCase().includes(lowercasedSearch) ||
        p.region?.toLowerCase().includes(lowercasedSearch)
      );
    }

    if (propertyType !== 'ALL') {
      result = result.filter(p => p.type?.toUpperCase() === propertyType.toUpperCase());
    }

    result = result.filter(p => Number(p.monthlyRent) <= Number(maxRent));

    setFilteredProperties(result);
  }, [searchTerm, propertyType, maxRent, properties]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/properties', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
        setFilteredProperties(data); 
        
        if (data.length > 0) {
          const highestRent = Math.max(...data.map((p:Property) => Number(p.monthlyRent) || 0));
          if (highestRent > 200000) setMaxRent(highestRent);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Find Your Perfect Home</h1>
          <p className="text-gray-500">Discover top-rated properties from our verified landlords.</p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10">
          <div className="flex items-center mb-4">
            <SlidersHorizontal className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Location/Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Mumbai, Andheri, Villa..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="ALL">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Max Budget (Rent)</span>
                <span className="text-blue-600 font-bold">{formatPrice(maxRent)}</span>
              </label>
              <input 
                type="range" 
                min="5000" 
                max="500000" 
                step="5000"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
          </h2>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No properties match your search</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or wait for landlords to be verified.</p>
            <button 
              onClick={() => { setSearchTerm(''); setPropertyType('ALL'); setMaxRent(200000); }}
              className="px-6 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="group block">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                  
                  <div className="relative h-60 bg-gray-200 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm capitalize">
                      {property.type?.toLowerCase() || 'Property'}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="truncate">{property.city}, {property.region}</span>
                    </div>
                    
                    {/* 👇 NAVIN ADD KELA: Title chya samor Blue Tick! 👇 */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors flex items-center">
                      {property.title}
                      {property.ownerVerified && (
                        <span title="Verified Owner">
                          <BadgeCheck className="h-5 w-5 text-blue-500 ml-2 flex-shrink-0" />
                        </span>
                      )}
                    </h3>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                      <div>
                        <span className="text-2xl font-black text-blue-600">
                          {formatPrice(property.monthlyRent)}
                        </span>
                        <span className="text-sm font-medium text-gray-500"> /mo</span>
                      </div>
                      
                      {user?.role === 'TENANT' && (
                        <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                           <Heart className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}