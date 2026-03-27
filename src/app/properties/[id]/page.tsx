'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, ArrowLeft, Heart, Share2, MessageCircle, Calendar,
  MapPin, Bed, Bath, Car, Trees, Utensils, PawPrint,
  Star, Shield, User
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
  
  // Favorites sathi state
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  // Jevha user login asel, tevha tyache favorites check karayche
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      checkIfFavorite();
    }
  }, [isLoggedIn, user, id]);

  const fetchProperty = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 👇 NAVIN BADAL: cache: 'no-store' takla ahe (Fresh data sathi) 👇
      const response = await fetch(`http://localhost:8080/api/properties/${id}`, {
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        throw new Error('Property not found');
      }

      const data = await response.json();
      setProperty(data);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

 // 👇 1. Check if Favorite (With Cache Buster & Logs) 👇
  const checkIfFavorite = async () => {
    if (!user?.id) return;
    try {
      // ?t=... taklyane browser kadhi ch juna data dakhvat nahi, nehemi freshanto!
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites?t=${new Date().getTime()}`);
      
      if (response.ok) {
        const savedPropertyIds = await response.json();
        
        console.log("🔥 Backend kadun aalele Saved IDs:", savedPropertyIds);
        console.log("🏠 Sadyachya Property cha ID ahe:", id);
        
        const isSaved = savedPropertyIds.includes(id);
        setIsFavorite(isSaved);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // 👇 2. Toggle Favorite (With Logs) 👇
  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!user?.id || isFavoriteLoading) return;
    setIsFavoriteLoading(true);

    try {
      if (isFavorite) {
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites/${id}`, { method: 'DELETE' });
        if (response.ok) {
          console.log("🗑️ Property successfully removed from database!");
          setIsFavorite(false);
        }
      } else {
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/favorites/${id}`, { method: 'POST' });
        if (response.ok) {
          console.log("✅ Property successfully saved in database!");
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleContactOwner = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (property && property.owner) {
      router.push(`/messages?user=${property.owner.id}`);
    } else {
      alert("Owner details not available yet.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/properties" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Back to Properties</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === property.owner?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Property Actions Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/properties" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <span className="text-sm text-gray-600">Back to properties</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Login asel tar ani owner nasel tarch heart dakhav */}
              {isLoggedIn && !isOwner && (
                <>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isFavoriteLoading}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share2 className="h-6 w-6" />
                  </button>
                </>
              )}
              
              {isOwner && (
                <Link href={`/properties/${property.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Edit Property
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-96">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img src={property.images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover" />
                    {property.images.length > 1 && (
                      <>
                        <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">←</button>
                        <button onClick={() => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">→</button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200"><Home className="h-24 w-24 text-gray-400" /></div>
                )}
                
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">{property.type}</div>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${property.available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {property.available ? 'Available' : 'Not Available'}
                </div>
              </div>

              {property.images && property.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button key={index} onClick={() => setCurrentImageIndex(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${index === currentImageIndex ? 'border-blue-600' : 'border-gray-200'}`}>
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-6"><MapPin className="h-5 w-5 mr-2" /><span>{property.address}, {property.city}, {property.region}</span></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center"><Bed className="h-5 w-5 text-gray-400 mr-2" /><span>{property.rooms} Rooms</span></div>
                <div className="flex items-center"><Bath className="h-5 w-5 text-gray-400 mr-2" /><span>{property.bathrooms} Baths</span></div>
                {property.area && <div className="flex items-center"><span className="text-gray-400 mr-2">m²</span><span>{property.area} sqm</span></div>}
                {property.floor !== null && property.floor !== undefined && <div className="flex items-center"><span className="text-gray-400 mr-2">#</span><span>Floor {property.floor}</span></div>}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.furnished && <div className="flex items-center"><Utensils className="h-5 w-5 text-green-600 mr-2" /><span>Furnished</span></div>}
                  {property.hasParking && <div className="flex items-center"><Car className="h-5 w-5 text-green-600 mr-2" /><span>Parking</span></div>}
                  {property.hasBalcony && <div className="flex items-center"><span className="text-green-600 mr-2">🏠</span><span>Balcony</span></div>}
                  {property.hasGarden && <div className="flex items-center"><Trees className="h-5 w-5 text-green-600 mr-2" /><span>Garden</span></div>}
                  {property.hasElevator && <div className="flex items-center"><span className="text-green-600 mr-2">🛗</span><span>Elevator</span></div>}
                  {property.petsAllowed && <div className="flex items-center"><PawPrint className="h-5 w-5 text-green-600 mr-2" /><span>Pets Allowed</span></div>}
                  {property.smokingAllowed && <div className="flex items-center"><span className="text-green-600 mr-2">🚬</span><span>Smoking Allowed</span></div>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rental Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="text-gray-600">Period: </span><span className="font-medium">{property.rentalPeriod === 'SHORT_TERM' ? 'Short Term' : property.rentalPeriod === 'LONG_TERM' ? 'Long Term' : 'Flexible'}</span></div>
                  {property.minRentalMonths && <div><span className="text-gray-600">Minimum Rent: </span><span className="font-medium">{property.minRentalMonths} months</span></div>}
                  {property.maxRentalMonths && <div><span className="text-gray-600">Maximum Rent: </span><span className="font-medium">{property.maxRentalMonths} months</span></div>}
                  {property.availableFrom && <div><span className="text-gray-600">Available From: </span><span className="font-medium">{formatDate(property.availableFrom)}</span></div>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">{formatPrice(property.monthlyRent)}</div>
                <div className="text-gray-600">/month</div>
              </div>
              {property.deposit && <div className="flex justify-between items-center mb-2"><span className="text-gray-600">Deposit:</span><span className="font-medium">{formatPrice(property.deposit)}</span></div>}
              {property.utilities && <div className="flex justify-between items-center mb-4"><span className="text-gray-600">Utilities:</span><span className="font-medium">{formatPrice(property.utilities)}/month</span></div>}
              
              {!isOwner && property.available && (
                <button onClick={handleContactOwner} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 mr-2" />Contact Owner
                </button>
              )}
              {!property.available && <div className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-lg text-center">Not Available</div>}
            </div>

            {property.owner && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {property.owner.avatar ? <img src={property.owner.avatar} alt="Owner" className="w-12 h-12 rounded-full object-cover" /> : <User className="h-6 w-6 text-gray-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{property.owner.firstName} {property.owner.lastName}</h4>
                    {property.owner.verified && <div className="flex items-center text-green-600 text-sm"><Shield className="h-4 w-4 mr-1" />Verified</div>}
                  </div>
                </div>
                {property.owner.city && property.owner.region && <div className="flex items-center text-gray-600 text-sm mb-3"><MapPin className="h-4 w-4 mr-1" />{property.owner.city}, {property.owner.region}</div>}
                <div className="flex items-center text-gray-600 text-sm mb-4"><Calendar className="h-4 w-4 mr-1" />On TrustRent since {formatDate(property.owner.createdAt || new Date().toISOString())}</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}