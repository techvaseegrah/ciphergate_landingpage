import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// BROWSER MOCKUP WITH CLICK-TO-EXPAND
const BrowserMockup = ({ images, packageName, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-100/50 bg-white shadow-sm p-1.5 transition-transform hover:scale-[1.01] duration-500">
      {/* Refined Address Bar Header */}
      <div className="bg-white px-5 py-5 flex items-center">
        <div className="flex gap-1.5 mr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        </div>
        
        <div className="flex-1 max-w-[200px] mx-auto bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-xl py-1.5 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            {packageName.toLowerCase().replace(/\s+/g, '-')}.interface
          </span>
        </div>
        <div className="w-[60px]" />
      </div>

      {/* Internal Image Container - Clickable */}
      <div 
        onClick={() => onImageClick(images[currentIndex])}
        className="relative aspect-[1.4/1] bg-slate-50/50 rounded-[1.8rem] overflow-hidden border border-slate-50 cursor-zoom-in group/img"
      >
        <AnimatePresence mode='wait'>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Navigation Dots (Pill Style) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div className={`h-1 rounded-full transition-all duration-500 ${currentIndex === 0 ? "w-4 bg-primary-green" : "w-1 bg-slate-200"}`} />
          <div className={`h-1 rounded-full transition-all duration-500 ${currentIndex === 1 ? "w-4 bg-primary-green" : "w-1 bg-slate-200"}`} />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
           <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 shadow-xl">
             CLICK TO ENLARGE
           </div>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const packages = [
    {
      name: 'SWEET HUB',
      tagline: 'Core Management System',
      images: ['/basic-package.png', '/basic-package2.png'],
      features: ['Centralized Admin Dashboard', 'Profit & Loss Analysis', 'Real-time Stock Tracking', 'Daily Inventory Logs'],
    },
    {
      name: 'GYM',
      tagline: 'Scale Your Operations',
      images: ['/Standard-Package.png', '/Standard-Package2.png'],
      features: ['Multi-store Synchronization', 'Advanced User Analytics', 'Priority Technical Support', 'Employee Performance Metrics'],
      featured: true
    },
    {
      name: 'SKY BAR',
      tagline: 'Enterprise Ecosystem',
      images: ['/Premium-Package.png', '/Premium-Package2.png'],
      features: ['Automated Tax Compliance', 'Third-party API Integrations', '24/7 Dedicated Account Manager', 'Custom Modular Workflows'],
    },
  ];

  return (
    <section className="py-24 bg-[#FDFDFE] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:48px_48px] opacity-40" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.span className="text-primary-green font-bold tracking-[0.3em] uppercase text-[10px] opacity-80">
            Infrastructure
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Precision Built for <span className="text-primary-green">Modern</span> Business.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.7 }}
              className={`relative flex flex-col p-5 rounded-[4rem] border transition-all duration-500 ${
                pkg.featured 
                ? 'bg-white border-primary-green/30 shadow-[0_40px_80px_-20px_rgba(34,197,94,0.12)]' 
                : 'bg-white border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg'
              }`}
            >
              <div className="mb-10">
                <BrowserMockup 
                    images={pkg.images} 
                    packageName={pkg.name} 
                    onImageClick={(img) => setSelectedImage(img)}
                />
              </div>

              <div className="px-6 pb-8 flex-grow">
                <div className="mb-6">
                  {/* UPDATED FONT STYLE TO MATCH IMAGE */}
                  <h3 className="text-2xl font-extrabold text-[#0f172a] tracking-tight uppercase leading-none">
                    {pkg.name}
                  </h3>
                  <p className="text-primary-green font-bold text-[10px] mt-2 tracking-[0.15em] uppercase opacity-80">
                    {pkg.tagline}
                  </p>
                </div>

                <ul className="space-y-4">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      <span className="text-slate-500 text-[13px] font-medium tracking-tight">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FULL SCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl p-6 md:p-20"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Enlarged view" 
                className="max-w-full max-h-full rounded-[3rem] shadow-2xl border border-slate-100 object-contain bg-white"
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-0 right-0 m-4 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center"
              >✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Features;