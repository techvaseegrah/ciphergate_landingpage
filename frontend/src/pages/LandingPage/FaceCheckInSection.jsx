import React from 'react';
import { motion } from 'framer-motion';

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center gap-3">
    <span className="text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight">{value}</span>
    <span className="text-sm md:text-base text-white font-normal tracking-wide">{label}</span>
  </div>
);

const FaceCheckInSection = ({ id }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section id={id} className="relative w-full bg-black landing-section overflow-hidden border-t border-white/[0.05]">
      <div className="landing-container">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          
          {/* LEFT: PHONE MOCKUP */}
          <motion.div 
            className="relative flex justify-center lg:justify-start"
            variants={itemVariants}
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/[0.03] rounded-full blur-[120px]" />
            
            <div className="relative z-10 w-full max-w-[500px]">
              <img 
                src="/mobile_face_checkin.png" 
                alt="Mobile Face Attendance" 
                className="w-full h-auto object-cover rounded-[40px] shadow-2xl"
              />
            </div>
          </motion.div>

          {/* RIGHT: CONTENT */}
          <motion.div className="flex flex-col items-center lg:items-start text-center lg:text-left" variants={itemVariants}>
            {/* BADGE */}
            <div 
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '14px',
                border: '1.5px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 0 12px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
                marginBottom: '32px',
                alignSelf: 'flex-start'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
              <span className="text-[11px] font-bold text-white tracking-[0.14em] uppercase">Effortless Check-in</span>
            </div>

            {/* HEADING */}
            <h2 className="title-gradient text-[32px] sm:text-[40px] md:text-5xl lg:text-[64px] leading-[1.2] md:leading-[1.1] tracking-tight mb-6 md:mb-8 w-full">
              Effortless Face Check-In<br className="hidden md:block" />
              <span className="md:hidden"> </span>For All Employees
            </h2>

            {/* DESCRIPTION */}
            <p className="text-white text-[14px] md:text-base lg:text-lg max-w-[520px] leading-relaxed mb-8 md:mb-12 font-light px-4 md:px-0">
              Employees can mark attendance instantly using secure face recognition on their mobile devices. Fast, accurate, and contactless tracking—anytime, anywhere.
            </p>

            {/* STATS */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-[600px] mb-12 md:mb-16 py-8 md:py-10 border-y border-white/[0.1] gap-8 sm:gap-0">
              <StatItem value="2+" label="Years Completed" />
              <div className="w-full sm:w-px h-px sm:h-20 bg-white/20 sm:bg-white/40 max-w-[120px] sm:max-w-none" />
              <StatItem value="2000+" label="Happy Clients" />
              <div className="w-full sm:w-px h-px sm:h-20 bg-white/20 sm:bg-white/40 max-w-[120px] sm:max-w-none" />
              <StatItem value="1800+" label="Companies" />
            </div>

            {/* CTA BUTTON */}
            <button
              className="group relative px-8 md:px-10 py-3 md:py-4 bg-white text-black text-[15px] font-bold flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden w-full sm:w-fit"
              style={{ clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)" }}
            >
              {/* Inner animated fill */}
              <div className="absolute inset-0 bg-[#f0f0f0] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              
              <span className="relative z-10">Explore Features</span>
              <svg 
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" 
                className="relative z-10 transition-transform duration-500 group-hover:translate-x-1"
              >
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default FaceCheckInSection;
