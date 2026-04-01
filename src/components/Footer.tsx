import Link from 'next/link';
import { Home, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-white pt-16 pb-8 border-t-4 border-blue-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
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
  );
}