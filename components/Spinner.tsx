import React from 'react';
import Image from 'next/image';


const ImprovedSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated logo container */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="absolute -inset-4 border-4 border-transparent border-t-blue-500 border-r-blue-300 rounded-full animate-spin"></div>
          
          <div className="absolute -inset-2 border-2 border-transparent border-t-indigo-400 border-l-indigo-200 rounded-full animate-spin"></div>
          <div className="absolute -inset-2 border-2 border-transparent border-t-indigo-400 border-l-indigo-200 rounded-full animate-spin animate-reverse"></div>
          
          {/* Logo with pulse animation */}
          <div className="relative animate-pulse">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
              {/* Placeholder for your logo - replace with actual Image component */}
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                 <Image className="justify-center items-center" src={"/logo.jpg"}  width={100} height={100} alt="Clips Logo" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading text with typing animation */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedSpinner;