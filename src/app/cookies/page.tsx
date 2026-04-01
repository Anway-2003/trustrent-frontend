import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Cookie } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-full">
              <Cookie className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-4">
            Cookie Policy
          </h1>
          <p className="text-center text-gray-500 mb-12">Last updated: April 1, 2026</p>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. What Are Cookies</h2>
              <p>
                Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How TrustRent Uses Cookies</h2>
              <p>
                When you use and access TrustRent, we may place a number of cookies files in your web browser. We use cookies to enable certain functions of the Service (like keeping you logged in), to provide analytics, and to store your preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Essential Cookies</h2>
              <p>
                Some cookies are essential for the operation of our platform. For example, we use authentication cookies (`token` and session data in LocalStorage) to identify users and prevent fraudulent use of user accounts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Your Choices Regarding Cookies</h2>
              <p>
                If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, and some of our pages might not display properly.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}