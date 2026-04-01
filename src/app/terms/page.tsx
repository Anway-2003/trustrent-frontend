import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-full">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-4">
            Terms of Service
          </h1>
          <p className="text-center text-gray-500 mb-12">Last updated: April 1, 2026</p>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the TrustRent platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Property Listings (Landlords)</h2>
              <p>
                Landlords are responsible for the accuracy of their property listings. TrustRent reserves the right to remove any listing that is deemed fraudulent, misleading, or violates community guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Limitation of Liability</h2>
              <p>
                TrustRent acts solely as a platform to connect landlords and tenants. We are not a party to any rental agreement or transaction between users. We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our platform.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}