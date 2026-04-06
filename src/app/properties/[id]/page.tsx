'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, ArrowLeft, Heart, Share2, MessageCircle, Calendar,
  MapPin, Bed, Bath, Car, Trees, Utensils, PawPrint,
  Star, Shield, User, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  region: string;
  country: string;
  rooms: number;
  bathrooms: number;
  area?: number;
  floor?: number;
  hasElevator: boolean;
  hasParking: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  furnished: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  monthlyRent: number;
  deposit?: number;
  utilities?: number;
  available: boolean;
  availableFrom?: string;
  rentalPeriod: string;
  minRentalMonths?: number;
  maxRentalMonths?: number;
  images: string[];
  owner?: { 
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string; // 👈 Add kela (WhatsApp sathi)
    verified: boolean;
    city?: string;
    region?: string;
    createdAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { id } = use(params);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      checkIfFavorite();
    }
  }, [isLoggedIn, user, id]);

  const fetchProperty = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/properties/${id}`, {
        cache: 'no-store' 
      });
      if (!response.ok) throw new Error('Property not found');
      const data = await response.json();
      setProperty(data);
    } catch (err) {
      setError('Connection error. Server check kar.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/users/${user.id}/favorites?t=${new Date().getTime()}`);
      if (response.ok) {
        const savedPropertyIds = await response.json();
        setIsFavorite(savedPropertyIds.includes(id));
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!user?.id || isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`https://trustrent-backend.onrender.com/api/users/${user.id}/favorites/${id}`, { method });
      if (response.ok) setIsFavorite(!isFavorite);
    } catch (err) { console.error(err); } 
    finally { setIsFavoriteLoading(false); }
  };

  // 👈 🟢 FIX: DIRECT WHATSAPP CHAT LOGIC 🟢
  const handleContactOwner = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (property && property.owner && property.owner.phone) {
      // Phone number madhle spaces kiva symbols kadhnya sathi
      const cleanPhone = property.owner.phone.replace(/\D/g, '');
      
      // Auto-message format
      const message = `Hello ${property.owner.firstName}, I am interested in your property: "${property.title}" in ${property.city}. Is it still available? (Seen on TrustRent)`;
      
      // WhatsApp URL (Web ani Mobile sathi best)
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      
      // Navin tab madhe ughadne
      window.open(whatsappUrl, '_blank');
    } else {
      alert("Owner's phone number is not available. Please try again later.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
  if (error || !property) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center"><div><Home className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h2 className="text-2xl font-bold mb-6">Property Not Found</h2><Link href="/properties" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Back to Properties</Link></div></div>;

  const isOwner = user?.id === property.owner?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/properties" className="flex items-center text-gray-400 hover:text-gray-600"><ArrowLeft className="h-6 w-6 mr-2" /> Back</Link>
            <div className="flex items-center space-x-4">
              {isLoggedIn && !isOwner && (
                <button onClick={handleToggleFavorite} disabled={isFavoriteLoading} className="p-2 text-gray-400 hover:text-red-500"><Heart className={`h-6 w-6 ${isFavorite ? 'text-red-500 fill-current' : ''}`} /></button>
              )}
              {isOwner && <Link href={`/properties/${property.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Edit Property</Link>}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-[450px]">
                {property.images?.length > 0 ? (
                  <>
                    <img src={property.images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover" />
                    {property.images.length > 1 && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 flex justify-between">
                        <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)} className="bg-white/90 p-2 rounded-full shadow hover:bg-white transition-colors">←</button>
                        <button onClick={() => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1)} className="bg-white/90 p-2 rounded-full shadow hover:bg-white transition-colors">→</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200"><Home className="h-24 w-24 text-gray-400" /></div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{property.type}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${property.available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{property.available ? 'Available' : 'Rented'}</span>
                </div>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <p className="flex items-center text-gray-500"><MapPin className="h-4 w-4 mr-1 text-blue-500" /> {property.address}, {property.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-blue-600">{formatPrice(property.monthlyRent)}</p>
                  <p className="text-gray-400 text-sm">Monthly Rent</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-50 mb-6">
                <div className="text-center"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Rooms</p><div className="flex justify-center items-center font-bold"><Bed className="h-4 w-4 mr-2 text-blue-500" /> {property.rooms}</div></div>
                <div className="text-center"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Baths</p><div className="flex justify-center items-center font-bold"><Bath className="h-4 w-4 mr-2 text-blue-500" /> {property.bathrooms}</div></div>
                <div className="text-center"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Area</p><div className="flex justify-center items-center font-bold">{property.area || 0} <span className="text-[10px] ml-1 uppercase">sqm</span></div></div>
                <div className="text-center"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Status</p><div className="flex justify-center items-center font-bold text-green-600">{property.available ? 'Live' : 'Rented'}</div></div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.furnished && <div className="flex items-center text-sm text-gray-600"><Utensils className="h-4 w-4 mr-2 text-green-500" /> Furnished</div>}
                  {property.hasParking && <div className="flex items-center text-sm text-gray-600"><Car className="h-4 w-4 mr-2 text-green-500" /> Parking Spot</div>}
                  {property.hasBalcony && <div className="flex items-center text-sm text-gray-600">🏠 <span className="ml-2">Balcony</span></div>}
                  {property.hasGarden && <div className="flex items-center text-sm text-gray-600"><Trees className="h-4 w-4 mr-2 text-green-500" /> Garden</div>}
                  {property.petsAllowed && <div className="flex items-center text-sm text-gray-600"><PawPrint className="h-4 w-4 mr-2 text-green-500" /> Pets Welcome</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">Pricing Details</h3>
               <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Monthly Rent</span><span className="font-bold">{formatPrice(property.monthlyRent)}</span></div>
                  {property.deposit && <div className="flex justify-between text-sm"><span className="text-gray-500">Security Deposit</span><span className="font-bold text-red-500">{formatPrice(property.deposit)}</span></div>}
                  {property.utilities && <div className="flex justify-between text-sm"><span className="text-gray-500">Utilities</span><span className="font-bold">{formatPrice(property.utilities)}</span></div>}
               </div>
              
              {!isOwner && property.available && (
                <button 
                  onClick={handleContactOwner} 
                  className="w-full bg-green-600 text-white py-4 px-4 rounded-xl hover:bg-green-700 transition-all font-bold flex items-center justify-center shadow-lg shadow-green-100"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact on WhatsApp
                </button>
              )}
            </div>

            {property.owner && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Listed By</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                    {property.owner.avatar ? <img src={property.owner.avatar} alt="Owner" className="w-full h-full object-cover" /> : <User className="h-6 w-6 text-gray-400" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{property.owner.firstName} {property.owner.lastName}</h4>
                    {property.owner.verified ? (
                       <div className="flex items-center text-green-600 text-xs font-bold mt-0.5"><Shield className="h-3 w-3 mr-1" /> Verified Owner</div>
                    ) : (
                       <div className="text-gray-400 text-xs mt-0.5">Community Member</div>
                    )}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
                   <div className="flex items-center text-xs text-gray-500"><MapPin className="h-3 w-3 mr-2" /> From {property.owner.city || 'India'}</div>
                   <div className="flex items-center text-xs text-gray-500"><Calendar className="h-3 w-3 mr-2" /> Since {formatDate(property.owner.createdAt)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}