// app/layout.tsx (RootLayout)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../context/UserContext"; // <- import your context

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ann Property | Dubai Real Estate Brokerage & Investment",
  description: "Explore premium Dubai properties with Ann Property. Buy, sell, or invest in residential and commercial real estate with trusted market insights and expert guidance.",
  keywords: "Dubai real estate, property for sale Dubai, property investment Dubai, real estate brokerage, luxury apartments Dubai, villas for sale Dubai, Ann Property",
  authors: [{ name: "Ann Property" }],
  openGraph: {
    title: "Ann Property | Dubai Real Estate Brokerage & Investment",
    description: "Explore premium Dubai properties with Ann Property. Buy, sell, or invest in residential and commercial real estate with trusted market insights and expert guidance.",
    url: "https://annproperty.com",
    siteName: "Ann Property",
    images: [
      {
        url: "https://annproperty.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ann Property Dubai Real Estate",
      },
    ],
    locale: "en_US",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
