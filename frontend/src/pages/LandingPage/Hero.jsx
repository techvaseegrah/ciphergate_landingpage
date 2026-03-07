import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Hero background color-cycle animation ───────────────────────────────── */
const heroBgStyle = `
  @keyframes colorCycle {
    0%   { filter: grayscale(0%)   brightness(1.05); }   /* full colour        */
    40%  { filter: grayscale(0%)   brightness(1.05); }   /* hold colour        */
    50%  { filter: grayscale(100%) brightness(0.85); }   /* fade to B&W        */
    90%  { filter: grayscale(100%) brightness(0.85); }   /* hold B&W           */
    100% { filter: grayscale(0%)   brightness(1.05); }   /* fade back to colour*/
  }
  .hero-video-bg {
    animation: colorCycle 10s ease-in-out infinite;
  }
`;

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
    }
  };

  // 2. ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  return (
    <section className="relative w-full h-[80vh] min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-[#fafafa]">
      {/* Inject color-cycle keyframes */}
      <style>{heroBgStyle}</style>

      {/* --- VIDEO BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="hero-video-bg w-full h-full object-cover">
          <source src={viewModel.videoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa]/60 via-[#fafafa]/30 to-[#fafafa]/90 backdrop-blur-sm"></div>
      </div>

      {/* --- MAIN CONTENT (Middle) --- */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col justify-center h-full">
        <motion.div
          className="flex flex-col items-start text-left mt-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* BRAND NAME */}
          <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-8 tracking-widest text-gray-900 uppercase" variants={itemVariants}>
            <span className="font-extralight">{viewModel.title.blackPart}</span>
            <span className="font-medium text-[#B76E79]">{viewModel.title.greenPart}</span>
          </motion.h1>

          {/* SUBTITLE */}
          <motion.p className="text-gray-500 text-sm md:text-base lg:text-lg max-w-2xl mb-12 font-light leading-loose tracking-wide" variants={itemVariants}>
            {viewModel.subtitle}
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div className="flex flex-col sm:flex-row gap-6 justify-start mb-24" variants={itemVariants}>
            <button
              onClick={() => navigate(viewModel.buttons.primary.path)}
              className="px-10 py-4 bg-gray-900 text-white text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:bg-black hover:scale-105"
            >
              {viewModel.buttons.primary.label}
            </button>
            <button
              onClick={() => navigate(viewModel.buttons.secondary.path)}
              className="px-10 py-4 border border-gray-300 text-gray-700 text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:border-gray-900 hover:text-gray-900 hover:bg-white"
            >
              {viewModel.buttons.secondary.label}
            </button>
          </motion.div>
        </motion.div>
      </div>


    </section>
  );
};

export default Hero;