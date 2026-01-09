import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Sub-component to handle the 3-second image rotation
const ImageSlider = ({ images, packageName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Only start timer if there is more than one image
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3000ms = 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
      {images.map((imgSrc, index) => (
        <img
          key={index}
          src={imgSrc}
          alt={`${packageName} view ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        />
      ))}
    </div>
  );
};

const Features = () => {
  const packages = [
    {
      name: 'Basic Package',
      description: 'Business Admin Dashboard & Financial Tracking',
      price: '$49',
      // Ensure these filenames match the files in your /public folder
      images: ['/basic-package.png', '/basic-package2.png'],
      features: ['Admin Dashboard', 'Profit & Loss Analysis', 'Shop Performance Tracking', 'Inventory Management'],
    },
    {
      name: 'Standard Package',
      description: 'Ideal for growing businesses',
      price: '$99',
      images: ['/Standard-Package.png', '/Standard-Package2.png'],
      features: ['Multi-store Support', 'Advanced Analytics', 'Priority Support', 'Employee Management'],
    },
    {
      name: 'Premium Package',
      description: 'Enterprise-level solution',
      price: '$199',
      images: ['/Premium-Package.png', '/Premium-Package2.png'],
      features: ['Unlimited Transactions', 'Custom Integrations', '24/7 Dedicated Support', 'Automated Tax Reports'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 0, opacity: 1 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-transparent">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark-navy mb-4 tracking-tight">Our Website Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Choose from our business-ready management solutions designed for efficiency.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="visible"
        >
          {packages.map((item, idx) => (
            <motion.div
              key={idx}
              className="group relative rounded-2xl overflow-hidden shadow-card border border-gray-200/50 bg-white/80 backdrop-blur-sm p-6 flex flex-col"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >

              {/* Image Container with Slider */}
              <div className="relative h-64 rounded-xl overflow-hidden mb-6 border border-gray-200 shadow-sm">
                <ImageSlider images={item.images} packageName={item.name} />
              </div>

              <h3 className="text-2xl font-bold text-dark-navy mb-2">{item.name}</h3>
              <p className="text-gray-600 text-base mb-6">{item.description}</p>

              <ul className="mb-8 space-y-3 flex-grow">
                {item.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start text-gray-700 text-base">
                    <svg className="w-5 h-5 mr-3 text-primary-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="w-full py-3.5 bg-primary-green text-white rounded-xl font-semibold hover:bg-[#1eb36a] transition-all duration-300 shadow-lg shadow-[#26D07C]/20 hover:shadow-xl hover:shadow-[#26D07C]/30">
                Select Package
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;