'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Home, SlidersHorizontal, Heart, BadgeCheck } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';

interface Property {
  id: string; title: string; type: string; city: string; region: string;
  monthlyRent: number; available: boolean; images: string[]; ownerVerified?: boolean;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');
  const [maxRent, setMaxRent] = useState<number>(200000);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trustrent-backend.onrender.com';

  useEffect(() => {
    fetch(`${API_URL}/api/properties`)
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        setFilteredProperties(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [API_URL]);

  useEffect(() => {
    let result = properties;
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(low) || p.city?.toLowerCase().includes(low));
    }
    if (propertyType !== 'ALL') result = result.filter(p => p.type?.toUpperCase() === propertyType.toUpperCase());
    result = result.filter(p => Number(p.monthlyRent) <= maxRent);
    setFilteredProperties(result);
  }, [searchTerm, propertyType, maxRent, properties]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Home</h1>
        
        <div className="bg-white p-6 rounded-xl border mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <input placeholder="Location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border p-2 rounded-md w-full" />
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="border p-2 rounded-md w-full">
            <option value="ALL">All Types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
          </select>
          <div className="flex flex-col">
            <label className="text-sm font-bold">Max Rent: ₹{maxRent.toLocaleString()}</label>
            <input type="range" min="5000" max="500000" step="5000" value={maxRent} onChange={(e) => setMaxRent(Number(e.target.value))} className="mt-2" />
          </div>
        </div>

        {isLoading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="relative h-60 bg-gray-100 w-full">
                  {property.images && property.images.length > 0 ? (
                    <Image 
                      src={property.images[0]} 
                      alt={property.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><Home size={40} /></div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold flex items-center">{property.title} {property.ownerVerified && <BadgeCheck className="text-blue-500 ml-2" size={20} />}</h3>
                  <p className="text-gray-500 flex items-center mt-1"><MapPin size={16} className="mr-1" /> {property.city}</p>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-2xl font-black text-blue-600">₹{property.monthlyRent.toLocaleString()}</span>
                    {user?.role === 'TENANT' && <Heart className="text-gray-300 hover:text-red-500" />}
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