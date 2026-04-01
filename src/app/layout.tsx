import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
// 👈 🟢 IMPORT NEXTAUTH PROVIDER
import NextAuthProvider from "@/components/NextAuthProvider"; 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TrustRent - Social Platform for Property Rentals",
  description: "Connect landlords and tenants in a trusted social network for property rentals",
  keywords: ["property rental", "landlord", "tenant", "social network", "real estate", "trust"],
  authors: [{ name: "TrustRent" }],
  creator: "TrustRent",
  publisher: "TrustRent",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TrustRent',
  },
  openGraph: {
    type: 'website',
    siteName: 'TrustRent',
    title: 'TrustRent - Social Platform for Property Rentals',
    description: 'Connect landlords and tenants in a trusted social network for property rentals',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'TrustRent Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustRent - Social Platform for Property Rentals',
    description: 'Connect landlords and tenants in a trusted social network for property rentals',
    images: ['/web-app-manifest-512x512.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1E40AF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TrustRent" />
        <meta name="application-name" content="TrustRent" />
        <meta name="msapplication-TileColor" content="#1E40AF" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        {/* 👈 🟢 SAGYAT IMP: Purna children la NextAuthProvider madhe wrap kara */}
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}