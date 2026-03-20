import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { label: '₹40,000', tag: 'Enterprise', color: '#111111', glow: 'rgba(0,0,0,0.05)' },
  { label: '₹30,000', tag: 'Advanced', color: '#333333', glow: 'rgba(0,0,0,0.05)' },
  { label: '₹20,000', tag: 'Standard', color: '#555555', glow: 'rgba(0,0,0,0.05)' },
  { label: '₹10,000', tag: 'Starter', color: '#777777', glow: 'rgba(0,0,0,0.05)' },
];

const websites = [
  { id: 1, name: 'Sweet Hub', url: '#', category: '₹40,000', description: 'E-commerce bakery with catalog & ordering', image: '/basic-package.png' },
  { id: 3, name: 'Sharurecreationclub', url: '#', category: '₹40,000', description: 'Club hub with events & membership', image: '/Premium-Package.png' },
  { id: 2, name: 'Ashurastribe', url: '#', category: '₹30,000', description: 'Community portal with dynamic content', image: '/Standard-Package.png' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

const Features = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCat = categories[activeIdx];
  const filtered = websites.filter((w) => w.category === activeCat.label);

  return (
    <section
      id="features"
      className="py-24 md:py-32 bg-[#fafafa] relative overflow-hidden border-t border-gray-100"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block px-3 py-1 border border-gray-300 text-gray-500 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase mb-6 bg-white">
            Our <span className="text-rose-gold-animate font-bold">Build</span> Websites
          </span>
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-6 tracking-wide">
            Our{' '}
            <span className="font-normal text-rose-gold-animate font-semibold">
              Build
            </span>{' '}
            Websites
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed tracking-wide">
            Handcrafted digital experiences tailored for every budget and business goal.
          </p>
        </div>

        {/* Category Pills */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-1.5 md:gap-2 mb-12 md:mb-16">
          {categories.map((cat, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`flex items-center justify-between md:justify-start gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-3.5 cursor-pointer text-[9px] md:text-xs tracking-[0.1em] uppercase transition-all duration-400 border ${isActive ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900'
                  }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 text-[8px] md:text-[9px] tracking-normal ${isActive ? 'bg-[#333] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                  {cat.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeIdx}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100"
            >
              {filtered.map((site, i) => (
                <WebsiteCard key={site.id} site={site} index={i} cat={activeCat} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${activeIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center justify-center py-24 px-6 border border-gray-200 bg-white"
            >
              <div className="text-center">
                <h3 className="text-lg font-normal text-gray-900 mb-4 tracking-[0.1em] uppercase">
                  Coming Soon
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed font-light tracking-wide">
                  We're crafting exciting new projects for the{' '}
                  <span className="text-gray-900 font-medium">
                    {activeCat.tag}
                  </span>{' '}
                  package. Check back soon.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

const WebsiteCard = ({ site, index, cat }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor-text="VISIT SITE"
      className={`bg-white relative cursor-pointer flex flex-col transition-colors duration-400 ${hovered ? 'bg-[#fafafa]' : ''}`}
    >
      {/* Image Section */}
      <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden flex-shrink-0 p-4 sm:p-8 bg-[#fafafa]">
        <img
          src={site.image}
          alt={site.name}
          className={`w-full h-full object-contain transition-all duration-700 ${hovered ? 'scale-105' : 'scale-100'}`}
        />
        {/* Subtle overlay */}
        <div className={`absolute inset-0 transition-colors duration-700 ${hovered ? 'bg-black/10' : 'bg-black/5'}`} />

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white px-2 py-1 text-[9px] font-medium text-gray-900 tracking-widest border border-gray-100">
          {cat.label}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-8 md:p-10 flex flex-col flex-1 overflow-hidden">
        <h3 className="font-normal text-[11px] sm:text-lg text-gray-900 mb-2 sm:mb-4 tracking-wide uppercase break-words leading-tight">
          {site.name}
        </h3>

        <p className="text-gray-500 text-[10px] sm:text-sm font-light leading-relaxed mb-6 sm:mb-8 flex-1 line-clamp-3 sm:line-clamp-none">
          {site.description}
        </p>

        {/* CTA Button */}
        <a
          href={site.url}
          className={`inline-flex items-center justify-center w-max px-4 sm:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-400 border ${hovered ? 'bg-[#111] text-white border-[#111]' : 'bg-transparent text-gray-600 border-gray-300'}`}
        >
          View Live Site
        </a>
      </div>
    </motion.div>
  );
};

export default Features;