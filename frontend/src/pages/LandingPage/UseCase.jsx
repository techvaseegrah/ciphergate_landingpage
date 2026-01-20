import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- STYLING CONSTANTS ---
const PRIMARY_GREEN = "#22c55e";

// --- NEW COMPONENT: IMAGE MODAL (ZOOM VIEW) ---
const ImageModal = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 cursor-zoom-out"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-7xl w-full h-full flex items-center justify-center"
      >
        <img
          src={src}
          alt="Zoomed View"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 m-4 text-white/50 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

// --- UPDATED SUB-COMPONENT: PREMIUM BROWSER FRAME ---
const CinematicBrowser = ({ images, activeIndex, name, onImageClick }) => {
  return (
    <div className="relative group w-full max-w-2xl px-4 md:px-0">
      <div className="absolute -inset-10 bg-green-400/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div 
        onClick={() => onImageClick(images[activeIndex])}
        className="relative rounded-2xl border border-slate-200/60 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden aspect-[4/3] md:aspect-video transition-transform duration-500 group-hover:scale-[1.01] cursor-zoom-in"
      >
        <div className="bg-slate-50/50 backdrop-blur-sm border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          </div>
          <div className="px-4 py-0.5 rounded-full bg-slate-100 text-[9px] text-slate-400 font-mono tracking-wider uppercase">
            {name.toLowerCase().replace(/\s+/g, '-')}.interface
          </div>
          <div className="w-10" />
        </div>

        <div className="relative h-full w-full bg-white flex items-start justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={images[activeIndex]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="w-full h-auto object-cover"
              alt={`${name} Screenshot`}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent h-[10%] w-full animate-scan pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

const UseCaseSection = () => {
  const [activeImageIndexes, setActiveImageIndexes] = useState([0, 0, 0]);
  // --- NEW STATE FOR MODAL ---
  const [selectedImage, setSelectedImage] = useState(null);

  const useCases = [
    {
      id: "01",
      title: 'Smart Attendance',
      tagline: 'BIOMETRIC RECOGNITION',
      description: 'Beyond simple logs. Using GPS fencing and facial AI to ensure your workforce is exactly where they need to be, when they need to be there.',
      features: ['GPS Geofencing Verification', 'Facial Recognition AI', 'RFID & NFC Integration'],
      images: ['/Smart Attendance Management.png', '/Smart Attendance Management2.png.jpeg'],
    },
    {
      id: "02",
      title: 'Task Orchestration',
      tagline: 'WORKFLOW AUTOMATION',
      description: 'Eliminate friction. Assign complex task trees and track real-time progress through an intuitive visual board that bridges team communication.',
      features: ['Automated Sprint Cycles', 'Live Progress Dashboards', 'Cross-Team Collaboration'],
      images: ['/Task Management.png', '/Task Management2.png'],
    },
    {
      id: "03",
      title: 'Financial Engine',
      tagline: 'SALARY & COMPLIANCE',
      description: 'Precision payroll. Automated deduction logic and rapid calculation engines turn hours of paperwork into seconds of processing.',
      features: ['Automated Deduction Logic', 'Rapid Batch Processing', 'Regulatory Compliance Logs'],
      images: ['/Salary Calculation.png', '/Salary Calculation2.png'],
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndexes(prev => prev.map((idx, i) => (idx + 1) % useCases[i].images.length));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 md:py-40 bg-white relative overflow-hidden font-sans">
      {/* ZOOM MODAL INTEGRATION */}
      <AnimatePresence>
        {selectedImage && (
          <ImageModal 
            src={selectedImage} 
            onClose={() => setSelectedImage(null)} 
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col items-center text-center mb-32 md:mb-48">
          <motion.p className="text-green-600 font-bold text-[10px] tracking-[0.4em] uppercase mb-6">
            Capabilities & Impact
          </motion.p>
          <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-10">
            Perfect for <br /> 
            <span className="text-green-500 italic font-light">Every Use Case.</span>
          </h2>
          <div className="w-16 h-1.5 bg-slate-900 rounded-full mb-10" />
        </div>

        <div className="space-y-40 md:space-y-64">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              className={`flex flex-col items-center gap-16 md:gap-32 ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'
              }`}
            >
              <div className="w-full md:w-1/2 flex justify-center">
                <CinematicBrowser 
                  images={useCase.images} 
                  activeIndex={activeImageIndexes[index]} 
                  name={useCase.title} 
                  onImageClick={(img) => setSelectedImage(img)} // Added Click Handler
                />
              </div>

              <div className="w-full md:w-1/2 relative">
                <span className="absolute -top-16 -left-10 text-[14rem] font-black text-slate-50/80 pointer-events-none -z-10 select-none tracking-tighter">
                  {useCase.id}
                </span>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <p className="text-green-600 font-bold text-xs tracking-[0.2em] uppercase">
                      {useCase.tagline}
                    </p>
                    <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                      {useCase.title}
                    </h3>
                  </div>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-lg">
                    {useCase.description}
                  </p>
                  <ul className="space-y-6 pt-4">
                    {useCase.features.map((feature, idx) => (
                      <motion.li key={idx} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-1.5 h-1.5 rounded-sm bg-slate-200 group-hover:bg-green-500 group-hover:rotate-45 transition-all duration-300" />
                        <span className="text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-wide">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        .animate-scan {
          animation: scan 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default UseCaseSection;