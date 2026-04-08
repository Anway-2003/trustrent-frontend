'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Building, ShieldCheck, CheckCircle, 
  XCircle, Search, UserCheck, AlertTriangle, ArrowLeft, ExternalLink,
  MessageSquare, Star, Eye, EyeOff // 👈 नवीन Icons ॲड केले
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
  govIdUrl?: string; 
}

// 👈 नवीन: Review चा इंटरफेस
interface AppReview {
  id: string;
  rating: number;
  comment: string;
  type: string;
  isApproved: boolean;
  createdAt: string;
  giverName: string;
  giverRole: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');

  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Reviews State
  const [reviewsList, setReviewsList] = useState<AppReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchReviews(); // 👈 ॲडमिन आला की दोन्ही डेटा घेऊन या
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://trustrent-backend.onrender.com/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsersList(data); 
      } else {
        const errorText = await response.text();
        console.error(`🚨 Backend Error! Status: ${response.status}, Details: ${errorText}`);
        setUsersList([]); 
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersList([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setIsReviewsLoading(true);
    try {
      const response = await fetch('https://trustrent-backend.onrender.com/api/reviews/all');
      if (response.ok) {
        setReviewsList(await response.json());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'Unverify' : 'Verify'} this user?`)) return;

    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/users/${userId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentStatus })
      });

      if (response.ok) {
        setUsersList(prev => prev.map(u => 
          u.id === userId ? { ...u, verified: !currentStatus } : u
        ));
      } else {
        alert("Failed to update in database. Backend check kar.");
      }
    } catch (error) {
      alert("Connection error! Spring Boot chalu ahe na?");
      console.error(error);
    }
  };

  const toggleReviewApproval = async (reviewId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus })
      });
      if (response.ok) {
        setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, isApproved: !currentStatus } : r));
      } else {
        alert("Failed to update feedback status.");
      }
    } catch (error) {
      alert("Error updating feedback status!");
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (u.role === 'ADMIN') return false;

    const matchesSearch = (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalLandlords = filteredUsers.filter(u => u.role === 'LANDLORD').length;
  const totalTenants = filteredUsers.filter(u => u.role === 'TENANT').length;
  const pendingVerifications = filteredUsers.filter(u => !u.verified).length;
  const pendingReviews = reviewsList.filter(r => !r.isApproved).length;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-gray-400 hover:text-white flex items-center text-sm mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Website
              </Link>
              <h1 className="text-3xl font-extrabold flex items-center">
                <ShieldCheck className="h-8 w-8 text-blue-500 mr-3" />
                Admin Control Panel
              </h1>
              <p className="text-gray-400 mt-2">Manage users, verifications, and platform safety.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* Stats Grid - Now 4 columns to fit the new Feedback card cleanly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Landlords</p>
              <p className="text-2xl font-bold text-gray-900">{totalLandlords}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{totalTenants}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center">
            <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold text-orange-600">{pendingVerifications}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex items-center">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Feedback</p>
              <p className="text-2xl font-bold text-purple-600">{pendingReviews}</p>
            </div>
          </div>
        </div>

        {/* 👈 नवीन: Tabs Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 font-bold text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserCheck className="h-5 w-5 inline mr-2" /> User Management
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-4 font-bold text-sm transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Star className="h-5 w-5 inline mr-2" /> Feedback Approvals
            {pendingReviews > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingReviews}</span>}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* ============================== */}
          {/* TAB 1: USERS (जुना कोड) */}
          {/* ============================== */}
          {activeTab === 'users' && (
            <>
              <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <UserCheck className="h-6 w-6 mr-2 text-gray-400" />
                  User Verification
                </h2>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search name or email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                    />
                  </div>
                  
                  <select 
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="LANDLORD">Landlords</option>
                    <option value="TENANT">Tenants</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">User Details</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Gov ID Document</th> 
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr><td colSpan={5} className="text-center p-8 text-gray-500">Loading DB data...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center p-8 text-gray-500">No users found.</td></tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className={`${u.govIdUrl && !u.verified ? 'bg-blue-50/40' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                                {u.firstName?.charAt(0) || 'U'}{u.lastName?.charAt(0) || ''}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              u.role === 'LANDLORD' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="p-4">
                            {u.govIdUrl ? (
                              <a 
                                href={u.govIdUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center"
                              >
                                View ID <ExternalLink className="h-4 w-4 ml-1" />
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">Not Uploaded</span>
                            )}
                          </td>

                          <td className="p-4">
                            {u.verified ? (
                              <span className="flex items-center text-xs font-bold text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" /> VERIFIED
                              </span>
                            ) : (
                              <span className="flex items-center text-xs font-bold text-orange-500">
                                <AlertTriangle className="h-4 w-4 mr-1" /> PENDING
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => toggleVerification(u.id, u.verified)}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm border ${
                                u.verified 
                                  ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' 
                                  : 'bg-green-600 text-white hover:bg-green-700 border-transparent'
                              }`}
                            >
                              {u.verified ? 'Revoke Verification' : 'Verify User'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ============================== */}
          {/* TAB 2: REVIEWS (नवीन कोड) */}
          {/* ============================== */}
          {activeTab === 'reviews' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">User Details</th>
                    <th className="p-4 font-semibold">Rating & Feedback</th>
                    <th className="p-4 font-semibold">Visibility Status</th>
                    <th className="p-4 font-semibold text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isReviewsLoading ? (
                    <tr><td colSpan={4} className="text-center p-8 text-gray-500">Loading Reviews...</td></tr>
                  ) : reviewsList.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-8 text-gray-500">No feedback submitted yet.</td></tr>
                  ) : (
                    reviewsList.map(review => (
                      <tr key={review.id} className={`${!review.isApproved ? 'bg-yellow-50/30' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="p-4">
                          <div className="font-bold text-sm text-gray-900">{review.giverName}</div>
                          <div className="text-xs text-gray-500 font-medium mt-1">{review.giverRole}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </td>
                        
                        <td className="p-4 max-w-md">
                          <div className="flex text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                        </td>

                        <td className="p-4">
                          {review.isApproved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              <Eye className="h-3 w-3 mr-1" /> PUBLIC
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                              <EyeOff className="h-3 w-3 mr-1" /> PENDING
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleReviewApproval(review.id, review.isApproved)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors border ${
                              review.isApproved 
                                ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent'
                            }`}
                          >
                            {review.isApproved ? 'Hide from Public' : 'Approve & Publish'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}