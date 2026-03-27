'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface Landlord {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatar: string | null;
  city: string | null;
  role: string;
  avgRating: number;
  totalRatings: number;
  totalProperties: number;
  ownedProperties: Array<{
    id: string;
    title: string;
    monthlyRent: number;
    city: string;
    images: string[];
  }>;
  receivedReviews: Array<{
    rating: number;
    comment: string | null;
    createdAt: string;
    giver: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LandlordsPage() {
  const { user } = useAuth();
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchLandlords();
  }, [pagination.page, searchTerm, cityFilter, minRating]);

  const fetchLandlords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(cityFilter && { city: cityFilter }),
        ...(minRating > 0 && { minRating: minRating.toString() })
      });

      const response = await fetch(`/api/landlords?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch landlords');
      }

      const data = await response.json();
      setLandlords(data.landlords);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLandlords();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setMinRating(0);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading && landlords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Trusted Landlords
          </h1>
          <p className="text-gray-600">
            Connect with verified property owners in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by name or bio
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search landlords..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="Enter city..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Rating
                </label>
                <select
                  id="rating"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Any rating</option>
                  <option value={4}>4+ stars</option>
                  <option value={4.5}>4.5+ stars</option>
                  <option value={5}>5 stars</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {landlords.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No landlords found matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Landlords Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {landlords.map((landlord) => (
                <div key={landlord.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Profile Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {landlord.avatar ? (
                          <img
                            src={landlord.avatar}
                            alt={landlord.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-xl font-semibold">
                            {landlord.firstName[0]}{landlord.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {landlord.name}
                        </h3>
                        {landlord.city && (
                          <p className="text-gray-600 text-sm">{landlord.city}</p>
                        )}
                        {landlord.avgRating > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            {renderStars(landlord.avgRating)}
                            <span className="text-sm text-gray-600">
                              {landlord.avgRating} ({landlord.totalRatings} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {landlord.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {landlord.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{landlord.totalProperties} properties</span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        Verified
                      </span>
                    </div>

                    {/* Featured Properties */}
                    {landlord.ownedProperties.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Featured Properties</h4>
                        <div className="space-y-2">
                          {landlord.ownedProperties.slice(0, 2).map((property) => (
                            <div key={property.id} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600 truncate">{property.title}</span>
                              <span className="text-blue-600 font-medium">
                                €{property.monthlyRent}/month
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Review */}
                    {landlord.receivedReviews.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            {renderStars(landlord.receivedReviews[0].rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(landlord.receivedReviews[0].createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {landlord.receivedReviews[0].comment && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            "{landlord.receivedReviews[0].comment}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          - {landlord.receivedReviews[0].giver.firstName} {landlord.receivedReviews[0].giver.lastName}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/landlords/${landlord.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Profile
                      </Link>
                      {user && (
                        <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm">
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-3 py-2 border rounded-md ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
