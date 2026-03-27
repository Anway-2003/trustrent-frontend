'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { use } from 'react';

interface LandlordDetails {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  phone: string | null;
  role: string;
  verified: boolean;
  createdAt: string;
  avgRating: number;
  totalRatings: number;
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  properties: {
    available: Property[];
    rented: Property[];
  };
  receivedReviews: Review[];
}

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  monthlyRent: number;
  deposit: number | null;
  rooms: number;
  bathrooms: number;
  area: number | null;
  furnished: boolean;
  petsAllowed: boolean;
  available: boolean;
  availableFrom: string | null;
  images: string[];
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  type: string;
  createdAt: string;
  giver: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    city: string | null;
  };
}

export default function LandlordProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [landlord, setLandlord] = useState<LandlordDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'reviews'>('overview');

  useEffect(() => {
    fetchLandlordDetails();
  }, [id]);

  const fetchLandlordDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/landlords/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Landlord not found');
        }
        throw new Error('Failed to fetch landlord details');
      }

      const data = await response.json();
      setLandlord(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPropertyType = (type: string) => {
    return type.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/landlords"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Landlords
          </Link>
        </div>
      </div>
    );
  }

  if (!landlord) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {landlord.avatar ? (
                <img
                  src={landlord.avatar}
                  alt={landlord.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-2xl font-semibold">
                  {landlord.firstName[0]}{landlord.lastName[0]}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{landlord.name}</h1>
                {landlord.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              
              <div className="text-gray-600 space-y-1">
                {landlord.city && (
                  <p className="flex items-center">
                    <span className="mr-2">📍</span>
                    {[landlord.city, landlord.region, landlord.country].filter(Boolean).join(', ')}
                  </p>
                )}
                <p className="flex items-center">
                  <span className="mr-2">🏠</span>
                  {landlord.totalProperties} properties ({landlord.availableProperties} available)
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📅</span>
                  Member since {formatDate(landlord.createdAt)}
                </p>
              </div>
              
              {landlord.avgRating > 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  {renderStars(landlord.avgRating)}
                  <span className="text-gray-600">
                    {landlord.avgRating} ({landlord.totalRatings} reviews)
                  </span>
                </div>
              )}
            </div>
            
            {user && user.id !== landlord.id && (
              <div className="flex flex-col space-y-2">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Send Message
                </button>
                <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors">
                  Add to Favorites
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {(['overview', 'properties', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {tab === 'properties' && ` (${landlord.totalProperties})`}
                  {tab === 'reviews' && ` (${landlord.totalRatings})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {landlord.bio || 'This landlord hasn\'t added a bio yet.'}
                    </p>
                  </div>

                  {/* Recent Properties */}
                  {landlord.properties.available.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Available Properties
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {landlord.properties.available.slice(0, 4).map((property) => (
                          <Link
                            key={property.id}
                            href={`/properties/${property.id}`}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                              <span className="text-blue-600 font-semibold">
                                €{property.monthlyRent}/month
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{property.city}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{property.rooms} rooms</span>
                              <span>{property.bathrooms} bathrooms</span>
                              {property.area && <span>{property.area}m²</span>}
                            </div>
                          </Link>
                        ))}
                      </div>
                      {landlord.properties.available.length > 4 && (
                        <button
                          onClick={() => setActiveTab('properties')}
                          className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                        >
                          View all {landlord.properties.available.length} available properties →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {landlord.email}
                      </p>
                      {landlord.phone && (
                        <p className="text-gray-600">
                          <span className="font-medium">Phone:</span> {landlord.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  {landlord.totalRatings > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Breakdown</h3>
                      <div className="space-y-2">
                        {Object.entries(landlord.ratingBreakdown)
                          .reverse()
                          .map(([rating, count]) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm w-6">{rating}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: `${landlord.totalRatings > 0 ? (count / landlord.totalRatings) * 100 : 0}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-6">
                {landlord.properties.available.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Available Properties ({landlord.properties.available.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {landlord.properties.available.map((property) => (
                        <Link
                          key={property.id}
                          href={`/properties/${property.id}`}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="h-48 bg-gray-200 flex items-center justify-center">
                            {property.images.length > 0 ? (
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500">No image</span>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                              <span className="text-blue-600 font-semibold">
                                €{property.monthlyRent}/month
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{property.city}</p>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                              {property.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatPropertyType(property.type)}</span>
                              <span>{property.rooms} rooms • {property.bathrooms} baths</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {landlord.properties.rented.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Rented Properties ({landlord.properties.rented.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {landlord.properties.rented.map((property) => (
                        <div
                          key={property.id}
                          className="border border-gray-200 rounded-lg overflow-hidden opacity-75"
                        >
                          <div className="h-48 bg-gray-200 flex items-center justify-center">
                            {property.images.length > 0 ? (
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500">No image</span>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                Rented
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{property.city}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatPropertyType(property.type)}</span>
                              <span>{property.rooms} rooms • {property.bathrooms} baths</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {landlord.totalProperties === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">This landlord hasn't listed any properties yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {landlord.receivedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {landlord.receivedReviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {review.giver.avatar ? (
                              <img
                                src={review.giver.avatar}
                                alt={`${review.giver.firstName} ${review.giver.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-sm font-semibold">
                                {review.giver.firstName[0]}{review.giver.lastName[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {review.giver.firstName} {review.giver.lastName}
                                </h4>
                                {review.giver.city && (
                                  <p className="text-sm text-gray-600">{review.giver.city}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-1 mb-1">
                                  {renderStars(review.rating)}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No reviews yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
