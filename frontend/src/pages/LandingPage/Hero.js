import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen min-h-[750px] flex items-center justify-center overflow-hidden bg-black">
      
      {/* 1. 4K CINEMATIC VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60 scale-110"
        >
          {/* Using a high-end tech abstract video link */}
          <source 
            src="https://cdn.pixabay.com/video/2023/10/20/185825-876251214_large.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        
        {/* Scanning Line Effect (Unique tech touch) */}
        <div className="absolute inset-0 w-full h-[2px] bg-[#26D07C]/20 top-0 animate-scan-line pointer-events-none" />
      </div>

      {/* 2. THE GLASS HUD CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 container mx-auto px-6"
      >
        <div className="relative max-w-5xl mx-auto backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[4rem] p-12 md:p-24 text-center shadow-2xl overflow-hidden">
          
          {/* Decorative Corner Brackets (Unique HUD Elements) */}
          <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-[#26D07C]/40 rounded-tl-xl" />
          <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-[#26D07C]/40 rounded-br-xl" />

          {/* Floating HUD Tag */}
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full bg-[#26D07C]/10 border border-[#26D07C]/30 text-[#26D07C] text-[10px] font-bold uppercase tracking-[0.4em]"
          >
            <span className="w-1.5 h-1.5 bg-[#26D07C] rounded-full animate-pulse" />
            System Status: Optimized
          </motion.div>

          {/* Headline: Clean & Powerful */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white">
            Cipher<span className="text-[#26D07C] relative">Gate
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#26D07C]/30 blur-sm" />
            </span>
          </h1>

          {/* Subheadline: High Legibility */}
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            The next evolution in <span className="text-white font-medium">Enterprise Security</span>. 
            Harnessing 4K Biometric AI to automate and secure your modern workforce.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => navigate('/admin/register')}
              className="px-12 py-5 bg-[#26D07C] text-white rounded-2xl font-bold text-lg hover:bg-[#1eb36a] transition-all hover:scale-105 shadow-[0_0_40px_rgba(38,208,124,0.3)]"
            >
              Initialize System
            </button>
            <button
              onClick={() => navigate('/admin/register')}
              className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg backdrop-blur-md hover:bg-white/10 transition-all"
            >
              Interface Demo
            </button>
          </div>

          {/* HUD Statistics (The "Unique" Touch) */}
          <div className="grid grid-cols-3 gap-4 mt-16 pt-12 border-t border-white/5 opacity-50">
            <div>
              <p className="text-[#26D07C] text-xl font-bold">99.9%</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Accuracy</p>
            </div>
            <div className="border-x border-white/10">
              <p className="text-[#26D07C] text-xl font-bold">&lt; 1s</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Latency</p>
            </div>
            <div>
              <p className="text-[#26D07C] text-xl font-bold">AES-256</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Security</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Floating Blobs (Background) */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#26D07C]/10 blur-[150px] rounded-full" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full" />
    </section>
  );
};

export default Hero;