'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function FeedbackPage() {
  const { isLoggedIn, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating!");
      return;
    }

    if (!user) {
      alert("User not found. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🟢 खरा Spring Boot API Call 🟢
      const response = await fetch('https://trustrent-backend.onrender.com/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giverId: user.id,
          receiverId: user.id, // Platform review असल्यामुळे स्वतःचाच ID receiver म्हणून पाठवलाय
          rating: rating.toString(),
          comment: message,
          type: "PLATFORM_REVIEW"
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setRating(0);
        setMessage('');
      } else {
        const errorData = await response.json();
        alert(`Failed to submit: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Connection error! Is your backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 relative overflow-hidden">
          
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
            <MessageSquareQuote className="h-48 w-48 text-blue-600" />
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">We value your feedback</h2>
              <p className="text-gray-500">Help us improve TrustRent for everyone.</p>
            </div>

            {!isLoggedIn ? (
              <div className="text-center bg-blue-50 p-6 rounded-xl border border-blue-100">
                <p className="text-blue-800 mb-4 font-medium">Please log in to share your experience with us.</p>
                <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Go to Login
                </Link>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-6">Your feedback has been submitted successfully. We appreciate your time!</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-blue-600 font-medium hover:text-blue-800 underline"
                >
                  Submit another response
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Star Rating Section */}
                <div className="flex flex-col items-center justify-center mb-8">
                  <p className="text-sm font-medium text-gray-700 mb-3">How would you rate your experience?</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`h-10 w-10 ${
                            (hoveredRating || rating) >= star 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          } transition-colors duration-200`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text Area */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us more about it
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="What did you like or dislike? How can we improve?"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}