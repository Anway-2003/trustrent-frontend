'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, MapPin, IndianRupee, Home, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'APARTMENT',
    city: '',
    region: '',
    rooms: 1,
    monthlyRent: '',
    images: [] as string[],
    available: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth Check: Landlord asel tarch allow kar
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) router.push('/login');
      else if (user?.role !== 'LANDLORD') {
        alert("Fakt Landlords property add karu shaktat!");
        router.push('/properties');
      }
    }
  }, [authLoading, isLoggedIn, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image Upload (Base64 conversion)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyRent: Number(formData.monthlyRent),
          ownerId: user?.id // Malakacha ID jo login ahe
        })
      });

      if (response.ok) {
        alert("Property successfully added! 🎉");
        router.push('/properties');
      } else {
        alert("Failed to add property. Check backend logs.");
      }
    } catch (error) {
      console.error("Error adding property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <PlusCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">List New Property</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
              <input type="text" name="title" required placeholder="e.g. Luxury 2BHK Apartment" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Type & Rent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none">
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="STUDIO">Studio</option>
                  <option value="VILLA">Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
                <input type="number" name="monthlyRent" required placeholder="15000" value={formData.monthlyRent} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" required placeholder="Mumbai" value={formData.city} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region/Area</label>
                <input type="text" name="region" required placeholder="Andheri West" value={formData.region} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows={4} required placeholder="Tell tenants about your property..." value={formData.description} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Photos</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload photos</p>
                  </div>
                  <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
              
              {/* Image Previews */}
              <div className="flex gap-4 mt-4 overflow-x-auto">
                {formData.images.map((img, index) => (
                  <img key={index} src={img} className="h-20 w-20 object-cover rounded-lg border" alt="Preview" />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isSubmitting ? "Posting Property..." : "Post Property Now"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}