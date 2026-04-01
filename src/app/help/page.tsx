import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { HelpCircle, MessageCircle, Home, User, ArrowRight } from 'lucide-react';

export default function HelpSupportPage() {
  const faqs = [
    {
      question: "How do I list my property as a Landlord?",
      answer: "Once you create a Landlord account, go to your Dashboard and click on 'List New Property'. Fill in the details, upload photos, and your property will be live for tenants to see."
    },
    {
      question: "Is TrustRent free for tenants?",
      answer: "Yes! Browsing properties, saving your favorites, and contacting verified landlords is completely free for tenants."
    },
    {
      question: "How does TrustRent verify users?",
      answer: "We use a strict KYC process. Users are required to provide valid ID proofs, and our automated system cross-checks the data to ensure maximum security."
    },
    {
      question: "What if I forget my password?",
      answer: "You can click on 'Forgot Password' on the login screen, or simply use 'Continue with Google' to log in securely without needing a password."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Everything you need to know about TrustRent, all in one place.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          
          {/* How It Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">How TrustRent Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Tenants */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <User className="h-24 w-24 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                  <User className="h-6 w-6 mr-2" /> For Tenants
                </h3>
                <ul className="space-y-4 text-gray-600 relative z-10">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">1</span>
                    Create a free profile and get verified.
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">2</span>
                    Browse hundreds of verified rental properties.
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">3</span>
                    Contact landlords directly and securely finalize your home.
                  </li>
                </ul>
                <div className="mt-8 relative z-10">
                  <Link href="/register?role=tenant" className="text-blue-600 font-bold flex items-center hover:text-blue-800">
                    Find a home <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* For Landlords */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Home className="h-24 w-24 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
                  <Home className="h-6 w-6 mr-2" /> For Landlords
                </h3>
                <ul className="space-y-4 text-gray-600 relative z-10">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm mr-3">1</span>
                    Register and list your property details with photos.
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm mr-3">2</span>
                    Your listing becomes visible to thousands of verified tenants.
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm mr-3">3</span>
                    Manage inquiries and rent out your property safely.
                  </li>
                </ul>
                <div className="mt-8 relative z-10">
                  <Link href="/register?role=landlord" className="text-green-600 font-bold flex items-center hover:text-green-800">
                    List a property <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Contact Support CTA */}
          <div className="bg-gray-900 rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <MessageCircle className="h-16 w-16 text-green-400 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Our support team is always ready to help you with any issues or questions you might have. Chat with us directly on WhatsApp for a quick response!
              </p>
              
              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/7420879087?text=Hello%20TrustRent%20Support,%20I%20need%20help%20with%20my%20account." 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-extrabold rounded-full text-green-900 bg-green-400 hover:bg-green-300 transition-colors shadow-lg"
              >
                Chat on WhatsApp
              </a>

              {/* Email Option */}
              <p className="mt-6 text-sm text-gray-500">
                Or email us at <a href="mailto:support@trustrent.com" className="text-blue-400 hover:text-blue-300 underline">support@trustrent.com</a>
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}