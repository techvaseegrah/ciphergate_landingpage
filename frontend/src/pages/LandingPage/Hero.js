import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    // CHANGE: Changed h-[40vh] to h-auto and adjusted padding (pt-20 pb-12) to fit content tightly
    <section className="relative h-auto min-h-[380px] w-full flex items-center justify-center bg-[#F9FAFB] overflow-hidden pt-20 pb-12">
      {/* Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#26D07C]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[40%] bg-[#26D07C]/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center">
        {/* Main Hero Content */}
        <div className="max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#26D07C]/10 border border-[#26D07C]/20">
            <span className="text-[#26D07C] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-[#26D07C] rounded-full animate-pulse"></span>
              Live Workforce Monitoring
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 font-poppins">
            <span className="bg-gradient-to-r from-black to-black bg-clip-text text-transparent">
              Cipher
            </span>
            <span className="bg-gradient-to-r from-green-500 to-green-500 bg-clip-text text-transparent">
              Gate
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#67748E] text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium">
            Advanced attendance management solution with biometric tracking for modern enterprises.
            Accurately monitor employee presence and streamline workforce management.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button
              onClick={() => navigate('/admin/register')}
              className="px-12 py-5 bg-[#26D07C] text-white rounded-full font-bold text-lg shadow-xl shadow-[#26D07C]/30 hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/admin/register')}
              className="px-12 py-5 border-2 border-[#26D07C] text-[#26D07C] rounded-full font-bold text-lg bg-white hover:bg-[#26D07C]/5 transition-all w-full sm:w-auto"
            >
              Request Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;