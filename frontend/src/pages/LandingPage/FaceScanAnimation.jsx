import React from 'react';

const FaceScanAnimation = () => {
  return (
    <div className="relative w-72 h-72 border-4 border-primary-green/20 rounded-[3rem] p-8 bg-white shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-green/5 to-transparent animate-pulse" />
      <div className="relative h-full w-full flex flex-col items-center justify-center">
         {/* Simple Passport/Face Icon */}
         <svg className="w-32 h-32 text-dark-navy" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
         </svg>
         <p className="mt-4 font-bold text-primary-green text-sm uppercase tracking-widest">Smart Check-in</p>
      </div>
      {/* Scanning Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary-green shadow-[0_0_15px_#26D07C] animate-scan" />
    </div>
  );
};

export default FaceScanAnimation;