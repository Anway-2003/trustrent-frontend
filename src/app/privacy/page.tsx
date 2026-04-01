import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-full">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-4">
            Privacy Policy
          </h1>
          <p className="text-center text-gray-500 mb-12">Last updated: April 1, 2026</p>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, update your profile, list a property, or communicate with other users on TrustRent. This includes your name, email address, phone number, and any identification documents required for verification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services. This includes verifying your identity to ensure a safe community, connecting landlords with potential tenants, and communicating with you about updates or security alerts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing of Information</h2>
              <p>
                We do not sell your personal information to third parties. We may share your information with other users only to the extent necessary to facilitate a rental transaction (e.g., sharing a landlord's contact info with a verified tenant).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Security</h2>
              <p>
                TrustRent takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet transmission is completely secure.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}