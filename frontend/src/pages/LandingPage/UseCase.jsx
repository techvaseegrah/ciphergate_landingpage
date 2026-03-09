import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- NEW COMPONENT: IMAGE MODAL (ZOOM VIEW) ---
const ImageModal = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-md p-4 md:p-10 cursor-zoom-out"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative max-w-7xl w-full h-full flex items-center justify-center"
      >
        <img
          src={src}
          alt="Zoomed View"
          className="max-w-full max-h-full object-contain border border-gray-200 shadow-2xl"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 m-6 text-gray-400 hover:text-black transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

// --- UPDATED SUB-COMPONENT: PREMIUM BROWSER FRAME ---
const CinematicBrowser = ({ images, activeIndex, name, onImageClick }) => {
  return (
    <div className="relative group w-full max-w-2xl px-4 md:px-0">
      <div
        onClick={() => onImageClick(images[activeIndex])}
        className="relative border border-gray-200 bg-white shadow-sm overflow-hidden aspect-[4/3] md:aspect-video transition-all duration-700 group-hover:shadow-xl cursor-zoom-in"
      >
        <div className="bg-[#fafafa] border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
          <div className="px-4 py-0.5 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            {name.toLowerCase().replace(/\s+/g, '-')}.interface
          </div>
          <div className="w-10" />
        </div>

        <div className="relative h-full w-full bg-white flex items-start justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={images[activeIndex]}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
              alt={`${name} Screenshot`}
            />
          </AnimatePresence>
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
    <section id="use-case" className="py-24 md:py-32 bg-white relative overflow-hidden font-sans border-t border-gray-100">
      {/* ZOOM MODAL INTEGRATION */}
      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

        <div className="flex flex-col items-center text-center mb-24 max-w-2xl mx-auto">
          <motion.p className="text-gray-500 font-medium text-xs tracking-[0.2em] uppercase mb-6">
            Capabilities & Impact
          </motion.p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 tracking-wide mb-8">
            Perfect for <span className="font-normal text-[#B76E79]">Every Use Case.</span>
          </h2>
          <div className="w-16 h-[1px] bg-gray-300" />
        </div>

        <div className="space-y-40 md:space-y-56">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              className={`flex flex-col items-center gap-16 md:gap-24 ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'
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

              <div className="w-full md:w-1/2 relative px-4 md:px-12">
                <span className="absolute -top-8 -left-2 md:-top-12 md:-left-12 text-7xl md:text-[12rem] font-extralight text-gray-50/80 pointer-events-none -z-10 select-none tracking-tighter">
                  {useCase.id}
                </span>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-gray-500 font-medium text-[10px] tracking-[0.25em] uppercase">
                      {useCase.tagline}
                    </p>
                    <h3 className="text-3xl md:text-5xl font-light text-gray-900 tracking-wide">
                      {useCase.title}
                    </h3>
                  </div>
                  <p className="text-base md:text-lg text-gray-500 leading-loose font-light max-w-lg">
                    {useCase.description}
                  </p>
                  <div className="pt-6 border-t border-gray-100">
                    <ul className="space-y-5">
                      {useCase.features.map((feature, idx) => (
                        <motion.li key={idx} className="flex items-center gap-6 group cursor-pointer">
                          <div className="w-8 h-[1px] bg-gray-300 group-hover:bg-black group-hover:w-12 transition-all duration-500" />
                          <span className="text-xs font-medium text-gray-500 group-hover:text-black transition-colors uppercase tracking-[0.1em]">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCaseSection;