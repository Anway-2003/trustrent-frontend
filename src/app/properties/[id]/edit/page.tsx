'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Save, X, Upload, Car, Trees, Utensils, PawPrint, Cigarette, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

interface PropertyFormData {
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  region: string;
  country: string;
  rooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  hasElevator: boolean;
  hasParking: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  furnished: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  monthlyRent: string;
  deposit: string;
  utilities: string;
  availableFrom: string;
  rentalPeriod: string;
  minRentalMonths: string;
  maxRentalMonths: string;
  available: boolean; 
}

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPropertyPage({ params }: EditPageProps) {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  
  // Unwrap params using React.use()
  const { id } = use(params);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '', description: '', type: 'APARTMENT', address: '', city: '', region: '',
    country: 'India', rooms: '', bathrooms: '', area: '', floor: '',
    hasElevator: false, hasParking: false, hasBalcony: false, hasGarden: false,
    furnished: false, petsAllowed: false, smokingAllowed: false,
    monthlyRent: '', deposit: '', utilities: '', availableFrom: '',
    rentalPeriod: 'LONG_TERM', minRentalMonths: '', maxRentalMonths: '', available: true
  });

  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Authentication Check
  useEffect(() => {
    if (!authLoading && (!isLoggedIn || user?.role !== 'LANDLORD')) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, user, router]);

  // 2. Fetch Existing Data
  useEffect(() => {
    if (user) {
      fetchPropertyDetails();
    }
  }, [id, user]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/properties/${id}`);
      if (!response.ok) throw new Error('Property not found');
      
      const data = await response.json();

      // SECURITY: Jar dusrya malakane edit karnya cha prayatna kela, tar tyala baher kadha
      if (data.owner?.id !== user?.id) {
        alert("You do not have permission to edit this property.");
        router.push('/my-properties');
        return;
      }

      // Populate form data
      setFormData({
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'APARTMENT',
        address: data.address || '',
        city: data.city || '',
        region: data.region || '',
        country: data.country || 'India',
        rooms: data.rooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        area: data.area?.toString() || '',
        floor: data.floor?.toString() || '',
        hasElevator: data.hasElevator || false,
        hasParking: data.hasParking || false,
        hasBalcony: data.hasBalcony || false,
        hasGarden: data.hasGarden || false,
        furnished: data.furnished || false,
        petsAllowed: data.petsAllowed || false,
        smokingAllowed: data.smokingAllowed || false,
        monthlyRent: data.monthlyRent?.toString() || '',
        deposit: data.deposit?.toString() || '',
        utilities: data.utilities?.toString() || '',
        availableFrom: data.availableFrom || '',
        rentalPeriod: data.rentalPeriod || 'LONG_TERM',
        minRentalMonths: data.minRentalMonths?.toString() || '',
        maxRentalMonths: data.maxRentalMonths?.toString() || '',
        available: data.available !== undefined ? data.available : true,
      });

      if (data.images && data.images.length > 0) {
        setImages(data.images);
      }
      
    } catch (err) {
      setError('Could not load property details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // 👈 🟢 VIP FIX: Convert Strings to Numbers before sending to Spring Boot!
    const payload = {
      ...formData,
      rooms: parseInt(formData.rooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: formData.area ? parseInt(formData.area) : 0,
      monthlyRent: parseInt(formData.monthlyRent) || 0,
      deposit: formData.deposit ? parseInt(formData.deposit) : 0,
      images
    };

    try {
      const response = await fetch(`https://trustrent-backend.onrender.com/api/properties/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Send the corrected payload
      });

      if (response.ok) {
        // Page force-reload houn fresh data gheil!
        window.location.href = '/my-properties';
      } else {
        setError('Error updating property. Please check the backend.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link href="/my-properties" className="mr-4 text-gray-500 hover:text-blue-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600 mt-1">Update your property details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>}

          {/* Status (Available/Rented) */}
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Availability Status</h2>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 cursor-pointer"
              />
              <span className={`font-medium ${formData.available ? 'text-green-600' : 'text-gray-600'}`}>
                {formData.available ? 'Currently Available for Rent' : 'Marked as Rented / Unavailable'}
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-2">Uncheck this if the property is already rented so it hides from public search.</p>
          </div>

          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required>
                  <option value="APARTMENT">Apartment</option><option value="HOUSE">House</option>
                  <option value="STUDIO">Studio</option><option value="ROOM">Room</option>
                  <option value="VILLA">Villa</option><option value="LOFT">Loft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region / State *</label>
                <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
          </div>

          {/* Property Details & Features */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* 👈 🟢 VIP FIX: onWheel added to all numbers! */}
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Rooms *</label><input type="number" name="rooms" value={formData.rooms} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms *</label><input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Area (sqm)</label><input type="number" name="area" value={formData.area} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
               <label className="flex items-center"><input type="checkbox" name="hasParking" checked={formData.hasParking} onChange={handleChange} className="rounded text-blue-600 mr-2" /> Parking</label>
               <label className="flex items-center"><input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange} className="rounded text-blue-600 mr-2" /> Furnished</label>
               <label className="flex items-center"><input type="checkbox" name="petsAllowed" checked={formData.petsAllowed} onChange={handleChange} className="rounded text-blue-600 mr-2" /> Pets Allowed</label>
               <label className="flex items-center"><input type="checkbox" name="hasGarden" checked={formData.hasGarden} onChange={handleChange} className="rounded text-blue-600 mr-2" /> Garden</label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 👈 🟢 VIP FIX: onWheel added to Rent & Deposit! */}
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹) *</label><input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full px-3 py-2 border border-gray-300 rounded-md" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Deposit (₹)</label><input type="number" name="deposit" value={formData.deposit} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Images</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <input type="file" accept="image/*" multiple ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add More Images</button>
            </div>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt="Property" className="w-full h-24 object-cover rounded-lg border" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/my-properties" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={isSubmitting} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Save className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}