'use client';

import { useRouter } from 'next/navigation';
import { User, Home, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function ChooseRolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateRole = async (selectedRole: 'TENANT' | 'LANDLORD') => {
    setIsLoading(true);
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      // 👈 🟢 VIP FIX: Backend ला Role Update करण्यासाठी API Call
      const response = await fetch('https://trustrent-backend.onrender.com/api/auth/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userData.email, 
          role: selectedRole 
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Backend कडून आलेला नवीन डेटा (ज्यात Role आहे) LocalStorage मध्ये सेव्ह करा
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // डायरेक्ट डॅशबोर्डला पाठवा
        window.location.href = '/dashboard';
      } else {
        alert("Failed to update role. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Connection error. Backend चालू आहे का ते चेक करा.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center mb-10">
        <div className="flex justify-center mb-4">
          <ShieldCheck className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">One Last Step!</h1>
        <p className="mt-2 text-gray-600">
          How do you plan to use <span className="font-bold text-blue-600">TrustRent</span>? 
          This helps us customize your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* TENANT OPTION */}
        <button 
          onClick={() => updateRole('TENANT')}
          disabled={isLoading}
          className="group p-8 bg-white border-2 border-gray-100 hover:border-blue-500 shadow-sm hover:shadow-xl rounded-2xl flex flex-col items-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-600 transition-colors">
            <User className="h-10 w-10 text-blue-600 group-hover:text-white" />
          </div>
          <span className="mt-4 text-xl font-bold text-gray-900">
            {isLoading ? 'Saving...' : 'I am a Tenant'}
          </span>
          <p className="mt-2 text-sm text-gray-500 text-center">
            I'm looking for a safe and verified home to rent.
          </p>
        </button>

        {/* LANDLORD OPTION */}
        <button 
          onClick={() => updateRole('LANDLORD')}
          disabled={isLoading}
          className="group p-8 bg-white border-2 border-gray-100 hover:border-green-500 shadow-sm hover:shadow-xl rounded-2xl flex flex-col items-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-600 transition-colors">
            <Home className="h-10 w-10 text-green-600 group-hover:text-white" />
          </div>
          <span className="mt-4 text-xl font-bold text-gray-900">
            {isLoading ? 'Saving...' : 'I am a Landlord'}
          </span>
          <p className="mt-2 text-sm text-gray-500 text-center">
            I want to list my property and find trusted tenants.
          </p>
        </button>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        You can always change your account type later in settings.
      </p>
    </div>
  );
}