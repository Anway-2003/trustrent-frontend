'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Edit, Save, X, 
  Camera, Shield, Calendar, CheckCircle2, ShieldAlert,
  UploadCloud, AlertCircle, FileCheck // 👈 नवीन Icons ॲड केले
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

// ==========================================
// 🛡️ नवीन कॉम्पोनंट: Gov ID Upload (Cloudinary)
// ==========================================
function GovIdUpload({ user, onUploadSuccess }: { user: any, onUploadSuccess: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // 🔴 इथे तुझे Cloudinary चे डिटेल्स टाक 🔴
  const CLOUD_NAME = "ddbqghvdz"; // उदा. dxyz123ab
  const UPLOAD_PRESET = "ay_default"; // उदा. ml_default

  // जर आधीच अपलोड केलं असेल पण ॲडमिनने verify केलं नसेल
  if (user.govIdUrl && !user.verified) {
    return (
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start space-x-4">
        <FileCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
        <div>
          <h4 className="text-blue-900 font-bold text-lg">Document Submitted</h4>
          <p className="text-blue-700 text-sm mt-1">
            Your ID has been securely uploaded and is waiting for Admin approval. Once verified, you will get the "Verified Owner" badge.
          </p>
        </div>
      </div>
    );
  }

  // जर Verify झाला असेल
  if (user.verified) {
    return (
      <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-start space-x-4">
        <Shield className="h-8 w-8 text-green-600 flex-shrink-0" />
        <div>
          <h4 className="text-green-900 font-bold text-lg">Identity Verified</h4>
          <p className="text-green-700 text-sm mt-1">
            Your official ID has been verified by the TrustRent Admin.
          </p>
        </div>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    setStatus('idle');

    try {
      // 1. Cloudinary वर फोटो अपलोड करणे
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();
      
      if (!cloudinaryRes.ok) throw new Error('Cloudinary Upload Failed');
      
      const secureUrl = cloudinaryData.secure_url; // ☁️ ढगातली लिंक

      // 2. बॅकएंडला (Spring Boot) लिंक पाठवणे
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trustrent-backend.onrender.com';
      const backendRes = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ govIdUrl: secureUrl }), 
      });

      if (backendRes.ok) {
        setStatus('success');
        setMessage('Document uploaded successfully! Waiting for Admin verification.');
        setFile(null);
        onUploadSuccess(secureUrl); // Local State update करण्यासाठी
      } else {
        throw new Error('Backend Update Failed');
      }

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Your Identity</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload your Aadhaar or PAN card to get the "Verified Landlord" badge and earn tenant trust.
      </p>

      {/* File Input Box */}
      <div className="flex items-center justify-center w-full mb-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-3 text-blue-500" />
            <p className="mb-1 text-sm text-gray-500">
              <span className="font-semibold text-blue-600">Click to upload</span> your Gov ID
            </p>
            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/png, image/jpeg" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            disabled={uploading} 
          />
        </label>
      </div>

      {file && (
        <div className="text-sm text-blue-700 mb-4 bg-blue-50 p-3 rounded-lg font-medium text-center border border-blue-100">
          📄 Selected: {file.name}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading securely to Cloud...' : 'Upload & Request Verification'}
      </button>

      {status === 'error' && (
        <div className="mt-4 flex items-center text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2" />
          {message}
        </div>
      )}
    </div>
  );
}


// ==========================================
// 👤 Main Profile Page (Tuzha Juna Code)
// ==========================================
export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  
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
    avatar: '', 
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size too large! Please select a photo under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: base64String }));
        setSuccess('Photo selected! 🎉 Save changes to update permanently.');
        if (error) setError('');
      };
      reader.readAsDataURL(file); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), 
      });

      if (response.ok) {
        const responseText = await response.text();
        let updatedData = {};
        if (responseText) {
          try { updatedData = JSON.parse(responseText); } catch (e) { }
        }
        
        const localUserStr = localStorage.getItem('user');
        const localUser = localUserStr ? JSON.parse(localUserStr) : user;
        const finalMergedUser = { ...localUser, ...formData, ...updatedData };
        
        localStorage.setItem('user', JSON.stringify(finalMergedUser));
        setSuccess('Profile updated successfully! 🎉');
        setIsEditing(false);

        setTimeout(() => { window.location.reload(); }, 800);
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

  if (!user) return null;

  const isLandlord = user.role === 'LANDLORD';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

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
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-28 w-28 rounded-full bg-white/20 p-1 backdrop-blur-sm flex items-center justify-center">
                    {formData.avatar ? ( 
                      <img 
                        src={formData.avatar} 
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

              {/* Trust Badge */}
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

            <form onSubmit={handleSubmit} className="space-y-8 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">First Name</label>
                  {isEditing ? (
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900" required />
                  ) : ( <p className="text-gray-900 font-semibold text-lg">{user.firstName}</p> )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Name</label>
                  {isEditing ? (
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900" required />
                  ) : ( <p className="text-gray-900 font-semibold text-lg">{user.lastName}</p> )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Email Address <span className="text-red-400 font-normal lowercase">(cannot be changed)</span>
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number</label>
                  {isEditing ? (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900" placeholder="+91 00000 00000" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">City</label>
                  {isEditing ? (
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900" placeholder="e.g. Pune" />
                  ) : ( <p className="text-gray-900 font-medium">{formData.city || 'Not provided'}</p> )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Region / State</label>
                  {isEditing ? (
                    <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900" placeholder="e.g. Maharashtra" />
                  ) : ( <p className="text-gray-900 font-medium">{formData.region || 'Not provided'}</p> )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">About Me (Bio)</label>
                {isEditing ? (
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900 resize-none" placeholder="Tell us a bit about yourself..." />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {user.bio || 'This user prefers to keep an air of mystery about them.'}
                  </p>
                )}
              </div>
            </form>

            {/* 👈 🟢 नवीन ॲड केलेलं सेक्शन: Identity Verification 🟢 */}
            {isLandlord && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <GovIdUpload 
                  user={user} 
                  onUploadSuccess={(url) => {
                    const updatedUser = { ...user, govIdUrl: url };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setTimeout(() => window.location.reload(), 1500);
                  }} 
                />
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
              <div className="flex items-center mb-4 md:mb-0">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
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