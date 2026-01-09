import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = ({ scrollYProgress }) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <section className="relative w-full flex items-center justify-center bg-transparent overflow-hidden min-h-screen pt-20 pb-20">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Large background blur */}
        <div className="absolute top-1/4 left-1/4 w-[60%] h-[50%] bg-[#26D07C]/5 blur-[200px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-[#1A2B3C]/5 blur-[150px] rounded-full"></div>

        {/* Decorative geometric shapes */}
        <div className="absolute top-1/3 left-1/5 w-64 h-64 border border-[#26D07C]/20 rounded-full opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/5 w-48 h-48 border border-[#1A2B3C]/20 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            className="inline-block px-6 py-3 mb-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#26D07C]/30 shadow-lg shadow-[#26D07C]/10"
            variants={itemVariants}
          >

          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-8 font-poppins tracking-tight max-w-5xl mx-auto"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-black to-black bg-clip-text text-transparent inline-block">Cipher</span>
            <span className="bg-gradient-to-r from-green-500 to-green-500 bg-clip-text text-transparent inline-block">Gate</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-[#67748E] text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 font-medium leading-relaxed max-w-3xl"
            variants={itemVariants}
          >
            Advanced attendance management solution with biometric tracking for modern enterprises.
            Accurately monitor employee presence and streamline workforce management.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            variants={itemVariants}
          >
            <button
              onClick={() => navigate('/admin/register')}
              className="px-10 py-5 bg-[#26D07C] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#26D07C]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out w-full sm:w-auto transform hover:scale-105 hover:bg-[#22b86a]"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/admin/register')}
              className="px-10 py-5 border-2 border-[#26D07C] text-[#26D07C] rounded-2xl font-bold text-lg bg-white/90 backdrop-blur-sm hover:bg-[#26D07C]/10 transition-all duration-300 ease-in-out w-full sm:w-auto transform hover:scale-105"
            >
              Request Demo
            </button>
          </motion.div>

          {/* Stats or Features Preview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full mt-12 pt-12 border-t border-gray-200/50"
            variants={containerVariants}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#1A2B3C] mb-2">99.9%</div>
              <div className="text-[#67748E] font-medium">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#1A2B3C] mb-2">10K+</div>
              <div className="text-[#67748E] font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#1A2B3C] mb-2">24/7</div>
              <div className="text-[#67748E] font-medium">Support</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;