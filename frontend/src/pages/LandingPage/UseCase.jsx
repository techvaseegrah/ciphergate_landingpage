import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useScrollAnimation from '../../hooks/useScrollAnimation.js';

const UseCase = () => {
  // Use a separate ref for each item to trigger animation individually
  const [useCaseRef1, isVisible1] = useScrollAnimation(0.2);
  const [useCaseRef2, isVisible2] = useScrollAnimation(0.2);
  const [useCaseRef3, isVisible3] = useScrollAnimation(0.2);

  // State to track touch events for zoom effect
  const [touchStates, setTouchStates] = useState({
    0: false,
    1: false,
    2: false
  });

  const handleTouchStart = (index) => {
    setTouchStates(prev => ({ ...prev, [index]: true }));
  };

  const handleTouchEnd = (index) => {
    setTouchStates(prev => ({ ...prev, [index]: false }));
  };

  // State to track current image index for carousel
  const [currentImageIndex, setCurrentImageIndex] = useState({
    0: 0,
    1: 0,
    2: 0
  });

  // Auto-slide images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const newState = { ...prev };
        useCases.forEach((_, index) => {
          if (useCases[index].images) {
            newState[index] = (newState[index] + 1) % useCases[index].images.length;
          }
        });
        return newState;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const useCases = [
    {
      ref: useCaseRef1,
      isVisible: isVisible1,
      title: 'Smart Attendance Management',
      description: 'Supports Face Recognition and RFID-based attendance with GPS location verification. Employees can punch in only if they are within the office premises.',
      icon: '',
      features: ['Advanced Threat Protection', 'Compliance Management', '24/7 Security Operations'],
      images: ['/Smart Attendance Management.png', '/Smart Attendance Management2.png.jpeg'],
    },
    {
      ref: useCaseRef2,
      isVisible: isVisible2,
      title: 'Task Management',
      description: 'Efficiently assign, track, and manage tasks for your workforce with our intuitive task management system. Streamline workflows and boost productivity.',
      features: ['Intuitive Task Assignment', 'Real-time Progress Tracking', 'Team Collaboration Tools'],
      images: ['/Task Management.png', '/Task Management2.png'],
    },
    {
      ref: useCaseRef3,
      isVisible: isVisible3,
      title: 'Salary Calculation',
      description: 'Automated salary computation with fine deductions.',
      features: ['Rapid Implementation', 'Flexible Pricing', 'Developer-Friendly APIs'],
      images: ['/Salary Calculation.png', '/Salary Calculation2.png'],
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section id="use-case" className="py-20 bg-transparent">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A2B3C] mb-6 font-poppins leading-tight tracking-tight">
            Perfect for <span className="text-[#26D07C]">Every Use Case</span>
          </h2>
          <p className="text-lg text-[#67748E] max-w-3xl mx-auto leading-relaxed">
            No matter your business size or industry, we have solutions tailored to your needs.
          </p>
        </motion.div>

        <motion.div
          className="space-y-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              variants={itemVariants}
            >
              {/* Image Section - Travigo Style Card */}
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="relative w-full group">
                  <div className="relative overflow-hidden rounded-2xl shadow-card border border-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <img
                      src={useCase.images[currentImageIndex[index]]}
                      alt={useCase.title}
                      className={`w-full h-[300px] md:h-[400px] object-contain transition-all duration-700 ease-in-out ${touchStates[index] ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                      onTouchStart={() => handleTouchStart(index)}
                      onTouchEnd={() => handleTouchEnd(index)}
                    />

                    {/* Soft Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B3C]/10 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Decorative Mint Accent behind image */}
                  <div className="absolute -z-10 -bottom-4 -right-4 w-2/3 h-2/3 bg-[#26D07C]/5 rounded-[3rem] blur-2xl"></div>
                </div>
              </div>

              {/* Text Content Section */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-6">
                  <h3 className="text-3xl md:text-4xl font-extrabold text-[#1A2B3C] font-poppins">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-lg text-[#67748E] leading-relaxed mb-8">
                  {useCase.description}
                </p>

                {/* Feature list with Mint Checkmarks */}
                <ul className="space-y-4 mb-10">
                  {useCase.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-center text-[#1A2B3C] font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="mr-4 bg-[#26D07C]/10 p-1.5 rounded-full">
                        <svg className="w-5 h-5 text-[#26D07C]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-base">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default UseCase;