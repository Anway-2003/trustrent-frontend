'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Edit, Save, X, 
  Camera, Shield, Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  
  // 👈 FIX: File input la access karnyasti ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    region: '',
    country: '',
    avatar: '', // Base64 string pathvnyasti
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
        avatar: user.avatar || '',
      });
    }
  }, [user]);

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

  // 👈 FIX: Camera Icon var click kelyavar gallery ughdane
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // 👈 FIX: Photo select kelyavar tyala Base64 text madhe convert karne
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Photo size check (Fakt 2MB paryant allow karu, database heavy na vhayla)
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size too large! Please select a photo under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result madhe purna Base64 text string ahe
        const base64String = reader.result as string;
        
        // Form data update kar (ata ha real photo text string madhe pathvel)
        setFormData(prev => ({ ...prev, avatar: base64String }));
        setSuccess('Photo selected! 🎉 Save changes to update permanently.');
        if (error) setError('');
      };
      reader.readAsDataURL(file); // Conversion start
    }
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
        headers: { 
  'Content-Type': 'application/json'
},
        body: JSON.stringify(formData), 
      });

      if (response.ok) {
        // 👈 FIX: Bulletproof Logic - Backend ne blank dila tari crash honar nahi
        const responseText = await response.text();
        let updatedData = {};
        if (responseText) {
          try {
            updatedData = JSON.parse(responseText);
          } catch (e) {
            console.log("Response text JSON navhta, ignore kelay");
          }
        }
        
        // Juna user data local storage madhun ghene
        const localUserStr = localStorage.getItem('user');
        const localUser = localUserStr ? JSON.parse(localUserStr) : user;

        // Juna data + Form cha fresh data + Backend cha data ekatra (Merge) karne
        const finalMergedUser = { ...localUser, ...formData, ...updatedData };
        
        // Update user data in localStorage so it reflects across the app
        localStorage.setItem('user', JSON.stringify(finalMergedUser));
        
        setSuccess('Profile updated successfully! 🎉');
        setIsEditing(false);

        // UI change na karta, data sync thevnyasti reload kela
        setTimeout(() => {
          window.location.reload();
        }, 800);

      } else {
        setError('Failed to update profile. Email already in use kiva backend error.');
      }
    } catch (err) {
      console.error("Save Error:", err);
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
        avatar: user.avatar || '',
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

      {/* 👈 FIX: Hidden File Input Jyane Gallery ughdel */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          
          {/* 🌟 Profile Header (Hero Section) */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-28 w-28 rounded-full bg-white/20 p-1 backdrop-blur-sm flex items-center justify-center">
                    {formData.avatar ? ( // 👈 Ata form data madhla direct check karuya
                      <img 
                        src={formData.avatar} // reader barobar dakhvto Base64
                        alt="Profile" 
                        className="h-full w-full rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-white flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold text-blue-600">
                           {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* 👈 FIX: Camera button linked to handleCameraClick */}
                  <button 
                    onClick={handleCameraClick}
                    className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 text-blue-600 transition-transform hover:scale-110 border border-gray-200"
                    title="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* Name & Role */}
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-1 flex items-center justify-center md:justify-start">
                    {user.firstName} {user.lastName}
                    {isLandlord && user.verified && (
                       // FIX: TypeScript Error Solved Here
                       <span title="Verified Owner" className="flex items-center ml-2">
                         <CheckCircle2 className="h-6 w-6 text-green-400" />
                       </span>
                    )}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start space-x-3 text-blue-100 font-medium">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm tracking-wider uppercase backdrop-blur-sm">
                      {user.role}
                    </span>
                    <span className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {formData.city || formData.region ? `${formData.city}, ${formData.region}` : 'Location not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badge (For Landlords) */}
              {isLandlord && (
                <div className="mt-6 md:mt-0 text-white bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
                  {user.verified ? (
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500/20 p-2 rounded-full">
                        <Shield className="h-8 w-8 text-green-400" />
                      </div>
                      <div>
                        <p className="text-green-300 font-bold tracking-wide uppercase text-xs mb-1">Status</p>
                        <p className="text-lg font-bold">Verified Owner</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="bg-yellow-500/20 p-2 rounded-full">
                        <ShieldAlert className="h-8 w-8 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-yellow-300 font-bold tracking-wide uppercase text-xs mb-1">Status</p>
                        <p className="text-lg font-bold">Pending Verification</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded shadow-sm flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                {success}
              </div>
            )}

            {/* Edit Toggle Header */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Details
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-md disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Form / Display */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* First Name */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold text-lg">{user.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold text-lg">{user.lastName}</p>
                  )}
                </div>

                {/* Email (Non-editable) */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Email Address <span className="text-red-400 font-normal lowercase">(cannot be changed)</span>
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                {/* City */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                      placeholder="e.g. Pune"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.city || 'Not provided'}</p>
                  )}
                </div>

                {/* Region */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Region / State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                      placeholder="e.g. Maharashtra"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.region || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  About Me (Bio)
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900 resize-none"
                    placeholder={isLandlord ? 
                      "Describe your experience as a property owner..." :
                      "Tell us a bit about yourself, your living preferences..."
                    }
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {user.bio || 'This user prefers to keep an air of mystery about them.'}
                  </p>
                )}
              </div>
            </form>

            {/* Account Info Footer */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
              <div className="flex items-center mb-4 md:mb-0">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full font-semibold">
                Account ID: <span className="ml-2 font-mono text-xs">{user.id?.substring(0, 8)}...</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}