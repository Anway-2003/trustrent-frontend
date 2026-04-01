'use client';

import Link from 'next/link';
// Added Twitter, Instagram, Linkedin, Mail, and MessageSquareQuote icons
import { Home, Users, Star, MessageCircle, Search, Shield, User, Twitter, Instagram, Linkedin, Mail, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navigation />

      <main className="flex-grow">
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

        {/* 🟢 Testimonials / Feedback Section Added Here */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Real feedback from verified landlords and tenants who found their perfect match on TrustRent.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feedback 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <MessageSquareQuote className="absolute top-4 right-4 h-8 w-8 text-blue-100" />
                <div className="flex text-yellow-400 mb-4">
                  <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "TrustRent made finding a tenant so easy. The verification process is top-notch, and I rented out my flat within 3 days without any broker!"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    R
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-gray-900">Rahul D.</p>
                    <p className="text-xs text-gray-500">Verified Landlord</p>
                  </div>
                </div>
              </div>

              {/* Feedback 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <MessageSquareQuote className="absolute top-4 right-4 h-8 w-8 text-blue-100" />
                <div className="flex text-yellow-400 mb-4">
                  <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5" />
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "I was tired of paying huge brokerages. Here I found direct owners, chatted with them, and finalized my PG. Absolutely love the UI!"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    S
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-gray-900">Sneha M.</p>
                    <p className="text-xs text-gray-500">Verified Tenant</p>
                  </div>
                </div>
              </div>

              {/* Feedback 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <MessageSquareQuote className="absolute top-4 right-4 h-8 w-8 text-blue-100" />
                <div className="flex text-yellow-400 mb-4">
                  <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "The direct communication feature is the best. No middlemen, no hidden charges. Just transparent renting. Highly recommended."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    A
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-gray-900">Amit P.</p>
                    <p className="text-xs text-gray-500">Verified Tenant</p>
                  </div>
                </div>
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
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-medium text-lg inline-block"
            >
              Start Now - It's Free
            </Link>
          </div>
        </section>
      </main>

      {/* Upgraded Professional Footer */}
      <footer className="bg-[#0f172a] text-white pt-16 pb-8 border-t-4 border-blue-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Brand & Slogan */}
            <div className="col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="p-1.5 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  Trust<span className="text-blue-500">Rent</span>
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed pr-4">
                The social platform for secure and reliable rentals. Find your dream home or trusted tenants effortlessly.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-100">Platform</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/properties" className="hover:text-blue-400 transition-colors">Find Homes</Link>
                </li>
                <li>
                  <Link href="/register?role=landlord" className="hover:text-blue-400 transition-colors">Find Tenants</Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-blue-400 transition-colors">How It Works</Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-100">Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-blue-400 transition-colors">Help Center</Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-blue-400 transition-colors">Contact Us</Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-blue-400 transition-colors">Safety</Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-100">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms</Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookies</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section (Copyright & Socials) */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} TrustRent. All rights reserved.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-5">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <span className="sr-only">Email</span>
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
}