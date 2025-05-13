"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative h-screen max-h-[800px] min-h-[600px] overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=2070&auto=format&fit=crop')",
            filter: "brightness(0.5)"
          }}
        />
      </div>
      
      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center h-full text-center px-6 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Main heading with red accent */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            DOMINATE THE <span className="text-red-600">OCTAGON</span> WITH PREMIUM MMA GEAR
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            From gloves to guards, we've got everything you need to train, fight, and win.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link 
              href="/products" 
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-md text-lg transition duration-300 transform hover:scale-105"
            >
              BROWSE NOW
            </Link>
            <Link 
              href="/products" 
              className="inline-block bg-transparent hover:bg-white/10 text-white border-2 border-white font-bold px-8 py-4 rounded-md text-lg transition duration-300"
            >
              BEST SELLERS
            </Link>
          </div>
          
          {/* Features */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-white max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-red-600/20 p-3 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold">Premium Quality</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-600/20 p-3 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-600/20 p-3 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-semibold">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-600/20 p-3 rounded-full mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="font-semibold">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Down arrow indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}