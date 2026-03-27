'use client';

import Link from 'next/link';
import { Home, Users, Star, MessageCircle, Search, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Social Network for <span className="text-blue-600">Rentals</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect landlords and tenants on a secure and reliable platform. 
            Find the perfect home or the ideal tenant with verified reviews and direct communication.
          </p>
          <div className="flex justify-center space-x-4">
            {isLoggedIn && user ? (
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register?role=tenant"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
                >
                  Find a Home
                </Link>
                <Link
                  href="/register?role=landlord"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium text-lg"
                >
                  List a Property
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why choose TrustRent?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Security and Trust
              </h3>
              <p className="text-gray-600">
                Verified review system and validated profiles to ensure 
                maximum security in transactions.
              </p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Active Community
              </h3>
              <p className="text-gray-600">
                Join a community of verified landlords and tenants 
                sharing experiences and tips.
              </p>
            </div>
            <div className="text-center p-6">
              <Search className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Search
              </h3>
              <p className="text-gray-600">
                Advanced algorithms to match landlords and tenants 
                based on preferences and compatibility.
              </p>
            </div>
            <div className="text-center p-6">
              <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Rating System
              </h3>
              <p className="text-gray-600">
                Bidirectional reviews to build reputation and 
                make informed decisions.
              </p>
            </div>
            <div className="text-center p-6">
              <MessageCircle className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Direct Communication
              </h3>
              <p className="text-gray-600">
                Integrated chat to communicate directly with interested 
                landlords and tenants.
              </p>
            </div>
            <div className="text-center p-6">
              <Home className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Simple Management
              </h3>
              <p className="text-gray-600">
                Intuitive dashboard to manage properties, applications, 
                and communications in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already found the perfect solution
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-medium text-lg"
          >
            Start Now - It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Home className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">TrustRent</span>
              </div>
              <p className="text-gray-400">
                The social platform for secure and reliable rentals.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/properties" className="hover:text-white">Find Homes</Link></li>
                <li><Link href="/landlords" className="hover:text-white">Find Tenants</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/safety" className="hover:text-white">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 TrustRent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}