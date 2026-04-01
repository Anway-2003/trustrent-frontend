'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Building, Heart, User, LogOut, 
  Menu, X, ShieldCheck, PlusCircle, 
  Search, LayoutDashboard, MessageSquareQuote
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react'; 

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    logout(); 
    await signOut({ callbackUrl: '/' }); 
  };

  const navLinkClass = (path: string) => `
    flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
    ${pathname === path 
      ? 'bg-blue-50 text-blue-700' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
  `;

  const getLogoLink = () => {
    if (!isLoggedIn) return '/';
    if (user?.role === 'ADMIN') return '/admin';
    return '/dashboard'; 
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center">
            <Link href={getLogoLink()} className="flex items-center gap-2 group">
              <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Trust<span className="text-blue-600">Rent</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1">
            {isLoggedIn ? (
              <>
                {user?.role === 'TENANT' && (
                  <>
                    <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                    </Link>
                    <Link href="/properties" className={navLinkClass('/properties')}>
                      <Search className="h-4 w-4 mr-2" /> Browse
                    </Link>
                    <Link href="/saved" className={navLinkClass('/saved')}>
                      <Heart className="h-4 w-4 mr-2" /> Saved
                    </Link>
                  </>
                )}

                {user?.role === 'LANDLORD' && (
                  <>
                    <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                    </Link>
                    <Link href="/properties" className={navLinkClass('/properties')}>
                      <Search className="h-4 w-4 mr-2" /> Browse
                    </Link>
                    <Link href="/my-properties" className={navLinkClass('/my-properties')}>
                      <Building className="h-4 w-4 mr-2" /> My Properties
                    </Link>
                    <Link href="/add-property" className={navLinkClass('/add-property')}>
                      <PlusCircle className="h-4 w-4 mr-2" /> List Property
                    </Link>
                  </>
                )}

                <div className="relative ml-4">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 bg-white"
                  >
                    <Menu className="h-5 w-5 text-gray-600 ml-1" />
                    <div className="bg-gray-100 p-1 rounded-full">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link href="/profile" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                        <User className="h-4 w-4 mr-3 text-gray-400" /> My Profile
                      </Link>
                      <Link href="/feedback" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                        <MessageSquareQuote className="h-4 w-4 mr-3 text-gray-400" /> Feedback
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-gray-600 font-semibold px-4 py-2">Login</Link>
                <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}