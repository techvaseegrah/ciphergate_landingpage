// src/pages/LandingPage/LandingPage.jsx

import React, { useRef } from 'react';
import { useScroll, motion } from 'framer-motion';
import Header from './Header.jsx';
import Hero from './Hero.jsx';
import ParallaxImage from './ParallaxImage.jsx';
import Features from './Features.jsx';
import UseCase from './UseCase.jsx';
import Pricing from './Pricing.jsx';
import Contact from './Contact.jsx';
import Footer from './Footer.jsx';

function LandingPage() {
  const scrollContainerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start start', 'end end']
  });

  return (
    <div className="App bg-transparent relative">
      <Header />

      <div className="relative">
        <div>
          <Hero scrollYProgress={scrollYProgress} />
        </div>
        <ParallaxImage scrollYProgress={scrollYProgress} />
      </div>

      <div className="space-y-16 md:space-y-20">
        <Features />
        <UseCase />
        <Pricing />
        <Contact />
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;