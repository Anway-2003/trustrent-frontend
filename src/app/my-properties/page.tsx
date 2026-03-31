'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Plus, Edit, Trash2, Eye, MapPin, IndianRupee, 
  Calendar, Users, ArrowLeft, MoreVertical 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface Property {
  id: string;
  title: string;
  type: string;
  address?: string;
  city: string;
  region: string;
  rooms: number;
  bathrooms?: number;
  monthlyRent: number;
  available: boolean;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function MyPropertiesPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in or not a landlord
  useEffect(() => {
    if (!isLoading && (!isLoggedIn || user?.role !== 'LANDLORD')) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, user, router]);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'LANDLORD') {
      fetchMyProperties();
    }
  }, [isLoggedIn, user]);

  const fetchMyProperties = async () => {
    setIsLoadingProperties(true);
    setError('');

    try {
      // Backend API Call for Landlord's properties
      const response = await fetch(`http://localhost:8080/api/properties/owner/${user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setProperties(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load properties');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Connection error. Is backend running?');
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // 👈 🟢 VIP FIX: togglePropertyAvailability (Smart Fetch & Update logic)
  const togglePropertyAvailability = async (propertyId: string, currentStatus: boolean) => {
    try {
      // 1. Aadhi backend kadhun tya property cha PURNA (Full) data ghene
      const getResponse = await fetch(`http://localhost:8080/api/properties/${propertyId}`);
      if (!getResponse.ok) {
        alert("Property cha data ghetana error aala!");
        return;
      }
      
      const fullPropertyData = await getResponse.json();

      // 2. Tyatla fakt 'available' status badalne (Toggle)
      fullPropertyData.available = !currentStatus;

      // 3. Aata ha purna pure data parat backend la pathvane
      const putResponse = await fetch(`http://localhost:8080/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPropertyData),
      });

      if (putResponse.ok) {
        // UI madhe lagech green/gray update karne
        setProperties(prev => 
          prev.map(prop => prop.id === propertyId ? { ...prop, available: !currentStatus } : prop)
        );
      } else {
        alert("Backend ne request reject keli! (Error 400/500)");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error! Spring Boot chalu ahe na check kar.");
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProperties(prev => prev.filter(prop => prop.id !== propertyId));
      } else {
        setError('Failed to delete property');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'LANDLORD') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-2">Manage your rental properties</p>
          </div>
          <Link href="/add-property" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.available).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rented</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => !p.available).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(
                    properties
                      .filter(p => !p.available)
                      .reduce((sum, p) => sum + p.monthlyRent, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties List */}
        {isLoadingProperties ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties listed yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start by adding your first property to start receiving tenants.
            </p>
            <Link href="/add-property" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Add First Property
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Property List ({properties.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {properties.map((property) => (
                <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Property Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Property Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {property.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              property.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {property.available ? 'AVAILABLE' : 'RENTED'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.city}, {property.region}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-700 font-medium">
                          <span>{property.rooms} Rooms</span>
                          <span className="font-bold text-blue-600">
                            {formatPrice(property.monthlyRent)}/mo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <Link href={`/properties/${property.id}`} className="p-2 text-gray-400 hover:text-blue-600 bg-white shadow-sm border rounded-lg transition-colors" title="View">
                        <Eye className="h-5 w-5" />
                      </Link>
                      
                      <Link href={`/properties/${property.id}/edit`} className="p-2 text-gray-400 hover:text-green-600 bg-white shadow-sm border rounded-lg transition-colors" title="Edit">
                        <Edit className="h-5 w-5" />
                      </Link>

                      <button
                        onClick={() => togglePropertyAvailability(property.id, property.available)}
                        className={`px-3 py-2 text-sm font-bold rounded-lg shadow-sm border transition-colors ${
                          property.available
                            ? 'bg-white text-gray-700 hover:bg-gray-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                        }`}
                      >
                        {property.available ? 'Mark as Rented' : 'Mark as Available'}
                      </button>

                      <button onClick={() => deleteProperty(property.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white shadow-sm border rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}