'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Building, Heart, User, LogOut, 
  Menu, X, ShieldCheck, PlusCircle, 
  Search, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
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
    // 👈 FIX: Aata Landlord aso kiva Tenant, Logo var click kelyavar Dashboard open hoil
    return '/dashboard'; 
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Logo */}
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

          {/* Center/Right Side: Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            
            {isLoggedIn ? (
              <>
                {/* TENANT SATHI LINKS */}
                {user?.role === 'TENANT' && (
                  <>
                    {/* 👈 FIX: Tenant la Dashboard Tab add kela */}
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

                {/* LANDLORD SATHI LINKS */}
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

                {/* ADMIN SATHI LINKS */}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                    <ShieldCheck className="h-4 w-4 mr-2" /> Admin Panel
                  </Link>
                )}

                {/* COMMON PROFILE & LOGOUT */}
                <div className="h-6 w-px bg-gray-200 mx-2"></div> {/* Divider */}
                
                <Link href="/profile" className={navLinkClass('/profile')}>
                  <User className="h-4 w-4 mr-2" /> Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </>
            ) : (
              /* GUESTS SATHI */
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-semibold px-4 py-2">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-sm">
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-lg absolute w-full">
          {isLoggedIn ? (
            <>
              {user?.role === 'TENANT' && (
                <>
                  {/* 👈 FIX: Mobile Menu madhe pan Tenant la Dashboard Tab add kela */}
                  <Link href="/dashboard" className={navLinkClass('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/properties" className={navLinkClass('/properties')} onClick={() => setIsMobileMenuOpen(false)}>Browse Properties</Link>
                  <Link href="/saved" className={navLinkClass('/saved')} onClick={() => setIsMobileMenuOpen(false)}>Saved Homes</Link>
                </>
              )}
              {user?.role === 'LANDLORD' && (
                <>
                  <Link href="/dashboard" className={navLinkClass('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/properties" className={navLinkClass('/properties')} onClick={() => setIsMobileMenuOpen(false)}>Browse Properties</Link>
                  <Link href="/my-properties" className={navLinkClass('/my-properties')} onClick={() => setIsMobileMenuOpen(false)}>My Properties</Link>
                  <Link href="/add-property" className={navLinkClass('/add-property')} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center"><PlusCircle className="h-4 w-4 mr-2" /> List Property</div>
                  </Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className={navLinkClass('/admin')} onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
              )}
              <div className="border-t border-gray-100 my-2 pt-2">
                <Link href="/profile" className={navLinkClass('/profile')} onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-3 pt-2">
              <Link href="/login" className="w-full text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="w-full text-center bg-blue-600 text-white px-4 py-3 rounded-lg font-bold shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}