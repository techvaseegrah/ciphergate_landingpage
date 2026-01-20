import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  const navigate = useNavigate();

  // 1. VIEW MODEL
  const viewModel = {
    videoUrl: "/hero.mp4",
    title: {
      blackPart: "Cipher",
      greenPart: "Gate"
    },
    subtitle: "Advanced attendance management solution with biometric tracking for modern enterprises. Accurately monitor employee presence and streamline workforce management.",
    buttons: {
      primary: { label: "Get Started", path: "/admin/register" },
      secondary: { label: "Request Demo", path: "/admin/register" }
    },
    stats: [
      { label: "UPTIME GUARANTEE", value: "99.9%" },
      { label: "ACTIVE USERS", value: "10K+" },
      { label: "SUPPORT", value: "24/7" }
    ]
  };

  // 2. ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative w-full h-[700px] flex flex-col items-center justify-center overflow-hidden bg-white">
      
      {/* --- VIDEO BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src={viewModel.videoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/30 to-white/95 backdrop-blur-[1px]"></div>
      </div>

      {/* --- MAIN CONTENT (Middle) --- */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6">
        <motion.div
          className="flex flex-col items-start text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* BRAND NAME WITH SCANNING ANIMATION */}
          <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tighter" variants={itemVariants}>
            <span className="text-black inline-block">
              {viewModel.title.blackPart.split("").map((char, i) => (
                <motion.span key={i} variants={letterVariants} className="inline-block">{char}</motion.span>
              ))}
            </span>
            <span className="relative text-[#26D07C] inline-block ml-1">
              {viewModel.title.greenPart.split("").map((char, i) => (
                <motion.span key={i} variants={letterVariants} className="inline-block">{char}</motion.span>
              ))}
              <motion.div 
                className="absolute left-0 w-full h-[2px] bg-[#26D07C] shadow-[0_0_8px_#26D07C] z-20"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </span>
          </motion.h1>

          {/* SUBTITLE */}
          <motion.p className="text-gray-700 text-base md:text-lg max-w-xl mb-8 font-medium leading-relaxed" variants={itemVariants}>
            {viewModel.subtitle}
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div className="flex flex-wrap gap-4 justify-start mb-20" variants={itemVariants}>
              <button
                onClick={() => navigate(viewModel.buttons.primary.path)}
                className="px-6 py-3 bg-[#26D07C] text-white rounded-lg font-bold text-base shadow-md shadow-green-200 hover:shadow-green-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                {viewModel.buttons.primary.label}
              </button>
              <button
                onClick={() => navigate(viewModel.buttons.secondary.path)}
                className="px-6 py-3 border-2 border-[#26D07C] text-[#26D07C] rounded-lg font-bold text-base bg-white/60 backdrop-blur-md hover:bg-[#26D07C] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
              >
                {viewModel.buttons.secondary.label}
              </button>
          </motion.div>
        </motion.div>
      </div>

      {/* --- STATS SECTION (Down in Center) --- */}
      <motion.div 
        className="absolute bottom-10 left-0 right-0 z-10 flex justify-center w-full px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        {/* max-w-4xl ensures they are centered and not spread too far apart */}
        <div className="grid grid-cols-3 gap-8 md:gap-24 max-w-4xl w-full">
          {viewModel.stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="text-xl md:text-3xl font-black text-[#1A2B3C] mb-1 whitespace-nowrap">
                {stat.value}
              </div>
              <div className="text-[#67748E] text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;