'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, User, Mail, Phone, MapPin, Edit, Save, X, 
  Camera, Star, Shield, Calendar, ArrowLeft, MessageCircle, Search,
  Award, TrendingUp, CheckCircle, Building, Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileStats, setProfileStats] = useState({
    totalProperties: 0,
    totalReviews: 0,
    averageRating: 0,
    verificationScore: 0,
    responseRate: 95,
    acceptanceRate: 78,
    paymentHistory: '100% on time',
  });
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    region: '',
    country: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.city || '',
        region: user.region || '',
        country: user.country || '',
      });
    }
  }, [user]);

  // Load profile statistics
  useEffect(() => {
    if (user) {
      loadProfileStats();
      loadReviews();
    }
  }, [user]);

  const loadProfileStats = async () => {
    try {
      // In future: Replace with actual backend endpoint
      const response = await fetch(`http://localhost:8080/api/users/${user?.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setProfileStats(data);
      } else {
        throw new Error("Stats not found");
      }
    } catch (error) {
      // Use mock data for demo
      setProfileStats({
        totalProperties: user?.role === 'LANDLORD' ? 3 : 0,
        totalReviews: 12,
        averageRating: 4.8,
        verificationScore: user?.verified ? 85 : 45,
        responseRate: 95,
        acceptanceRate: 78,
        paymentHistory: '100% on time',
      });
    }
  };

  const loadReviews = async () => {
    try {
      // In future: Replace with actual backend endpoint
      const response = await fetch(`http://localhost:8080/api/users/${user?.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        throw new Error("Reviews not found");
      }
    } catch (error) {
      // Use mock data for demo
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          comment: 'Excellent landlord! Professional and responsive.',
          giver: { firstName: 'Rahul', lastName: 'Sharma', verified: true },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          rating: 4,
          comment: 'Great experience, would recommend.',
          giver: { firstName: 'Priya', lastName: 'Patil', verified: true },
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
      ];
      setReviews(mockReviews);
    }
  };

  const getTrustLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-500' };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    return { level: 'New User', color: 'text-gray-600', bgColor: 'bg-gray-500' };
  };

  const getBadges = () => {
    const badges = [];
    
    if (user?.verified) {
      badges.push({
        icon: CheckCircle,
        label: 'Verified',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      });
    }
    
    if (profileStats.averageRating >= 4.5 && profileStats.totalReviews >= 5) {
      badges.push({
        icon: Star,
        label: 'Top Rated',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      });
    }
    
    if (user?.role === 'LANDLORD' && profileStats.totalProperties >= 5) {
      badges.push({
        icon: Building,
        label: 'Super Host',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      });
    }
    
    if (profileStats.totalReviews >= 10) {
      badges.push({
        icon: Users,
        label: 'Experienced',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      });
    }
    
    return badges;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Connect to Spring Boot Backend
      const response = await fetch(`http://localhost:8080/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Update user data in localStorage so it reflects across the app
        const updatedUser = { ...user, ...updatedData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Hard reload or state update can be done, but success message is enough
        setSuccess('Profile updated successfully! 🎉');
        setIsEditing(false);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Is backend running?');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.city || '',
        region: user.region || '',
        country: user.country || '',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isLandlord = user.role === 'LANDLORD';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/properties" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <User className="h-8 w-8 mr-3 text-blue-600" />
                My Profile
              </h1>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-blue-100 capitalize">
                    {user.role.toLowerCase()} {user.verified && '• Verified'}
                  </p>
                  <div className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-blue-100">
                      {formData.city && formData.region ? `${formData.city}, ${formData.region}` : 'Location not specified'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-white hidden md:block">
                  <div className="flex items-center justify-end mb-2">
                    <Star className="h-5 w-5 text-yellow-300 mr-1 fill-current" />
                    <span className="text-lg font-semibold">{profileStats.averageRating.toFixed(1)}</span>
                    <span className="text-blue-100 ml-1">({profileStats.totalReviews} reviews)</span>
                  </div>
                {user.verified && (
                  <div className="flex items-center justify-end">
                    <Shield className="h-4 w-4 text-green-300 mr-1" />
                    <span className="text-green-100 text-sm">Verified Profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* Trust Score Section */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  Trust Score
                </h3>
                <span className={`text-lg font-bold ${getTrustLevel(profileStats.verificationScore).color}`}>
                  {getTrustLevel(profileStats.verificationScore).level}
                </span>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getTrustLevel(profileStats.verificationScore).bgColor}`}
                    style={{ width: `${profileStats.verificationScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {profileStats.verificationScore}/100
                </span>
              </div>
              
              <p className="text-sm text-gray-600">
                Your Trust Score is based on verifications, reviews, and platform activity.
              </p>
            </div>

            {/* Badges Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 text-yellow-600 mr-2" />
                Badges & Recognition
              </h3>
              
              {getBadges().length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getBadges().map((badge, index) => (
                    <div key={index} className={`${badge.bgColor} p-4 rounded-lg text-center`}>
                      <badge.icon className={`h-6 w-6 ${badge.color} mx-auto mb-2`} />
                      <span className={`text-sm font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No badges yet. Keep using the platform to earn recognition!</p>
                </div>
              )}
            </div>

            {/* Rental Statistics */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                Rental Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="text-lg font-bold text-green-600">{profileStats.responseRate}%</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Acceptance Rate</span>
                    <span className="text-lg font-bold text-blue-600">{profileStats.acceptanceRate}%</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment History</span>
                    <span className="text-lg font-bold text-purple-600">{profileStats.paymentHistory}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Toggle */}
            <div className="flex justify-between items-center mb-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <div className="flex">
                      <Phone className="h-5 w-5 text-gray-400 mt-2 mr-2" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.phone || 'Not specified'}</p>
                    </div>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mumbai"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.city || 'Not specified'}</p>
                  )}
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region/State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Maharashtra"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.region || 'Not specified'}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={isLandlord ? 
                      "Describe yourself as a property owner, what you offer to tenants..." :
                      "Tell us a bit about yourself, your living preferences..."
                    }
                  />
                ) : (
                  <p className="text-gray-900 py-2 whitespace-pre-wrap">
                    {user.bio || 'No bio available'}
                  </p>
                )}
              </div>
            </form>

            {/* Account Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      isLandlord ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <p className="text-gray-900 capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
                      <dd className="text-2xl font-bold text-gray-900">{profileStats.averageRating.toFixed(1)}</dd>
                    </div>
                  </div>
                </div>
                
                {isLandlord ? (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Home className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500">Properties</dt>
                          <dd className="text-2xl font-bold text-gray-900">{profileStats.totalProperties}</dd>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <MessageCircle className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500">Reviews</dt>
                          <dd className="text-2xl font-bold text-gray-900">{profileStats.totalReviews}</dd>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <MessageCircle className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500">Messages</dt>
                          <dd className="text-2xl font-bold text-gray-900">45</dd>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Search className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <dt className="text-sm font-medium text-gray-500">Searches</dt>
                          <dd className="text-2xl font-bold text-gray-900">28</dd>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 text-yellow-600 mr-2" />
                  Recent Reviews
                </h3>
                <div className="flex items-center">
                  <div className="flex">
                    {renderStars(profileStats.averageRating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {profileStats.averageRating.toFixed(1)} ({profileStats.totalReviews} reviews)
                  </span>
                </div>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-700">
                              {review.giver.firstName.charAt(0)}{review.giver.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900 mr-2">
                                {review.giver.firstName} {review.giver.lastName}
                              </span>
                              {review.giver.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="ml-2 text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
                    </div>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Link 
                      href="#" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      See all reviews
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No reviews yet. Your first reviews will appear here!</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}