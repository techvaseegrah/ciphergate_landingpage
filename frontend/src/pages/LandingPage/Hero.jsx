import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = ({ id }) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section 
      id={id}
      className="hero-section relative w-full min-h-screen bg-[#000000] flex items-center justify-center text-white pt-24 pb-16 md:pt-32 md:pb-32 font-poppins overflow-hidden" 
    >
      <div className="landing-container w-full px-5 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 relative z-10">
        
        {/* Left Block: Text */}
        <motion.div 
          className="w-full lg:w-[55%] flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Headline */}
          <motion.h1 
            className="section-title text-center lg:text-left mb-8 lg:mb-12"
            variants={itemVariants}
          >
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-4">
              <span className="whitespace-nowrap">Track Attendance</span>
              <div className="flex items-center gap-x-4">
                <span className="whitespace-nowrap text-white">Just by</span>
                <span 
                  className="relative inline-flex items-center px-[16px] md:px-[32px] pb-[8px] md:pb-[18px] pt-[4px] md:pt-[12px] rounded-[10px] md:rounded-[14px] align-middle" 
                  style={{ 
                    color: '#ACACAC', 
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='14' ry='14' stroke='%23ACACAC' stroke-width='3' stroke-dasharray='16%2c 16' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`
                  }}
                >
                  <span style={{ color: '#ACACAC', WebkitTextFillColor: '#ACACAC' }}>Looking</span>
                  <motion.img 
                    src="/Group%201000005764.png"
                    alt="Employee cursor"
                    className="absolute top-[85%] md:top-[90%] left-[85%] md:left-[92%] w-[65px] md:w-[85px] z-20 pointer-events-none"
                    initial={{ opacity: 0, x: -10, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6, type: "spring", bounce: 0.4 }}
                  />
                </span>
              </div>
            </div>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-white text-[14px] md:text-[18px] w-full max-w-[540px] mb-8 md:mb-12 font-normal leading-relaxed tracking-wide" 
            variants={itemVariants}
          >
            Lightning-fast, secure facial recognition attendance automates check-ins, 
            ensuring accurate, real-time tracking and logs efficiently.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center justify-center lg:justify-start w-full" variants={itemVariants}>
            {/* Request Demo Button - SECONDARY */}
            <button 
              onClick={() => navigate('/admin/register')}
              className="btn-cyber-secondary w-full sm:w-auto px-[32px] h-[52px] md:h-[56px]"
            >
              Request Demo
            </button>

            {/* Get Started Button - PRIMARY */}
            <button
              onClick={() => navigate('/admin/register')}
              className="btn-cyber-primary w-full sm:w-auto px-[40px] h-[52px] md:h-[56px]"
            >
              Get Started 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>
        </motion.div>

        {/* Right Block: Image */}
        <motion.div 
          className="w-full lg:w-[50%] flex justify-center lg:justify-end relative z-0 mt-4 md:mt-8 lg:mt-0 px-4 md:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <img 
            src="/Group%2021.png" 
            alt="Face Recognition Visualization" 
            className="w-full h-auto max-w-[340px] md:max-w-[440px] lg:max-w-none lg:scale-[1.1] lg:translate-x-4 object-contain"
          />
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;