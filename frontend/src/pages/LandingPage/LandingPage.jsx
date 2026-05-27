// src/pages/LandingPage/LandingPage.jsx

import React, { useRef } from 'react';
import { useScroll, motion } from 'framer-motion';
import Header from './Header.jsx';
import Hero from './Hero.jsx';
import BentoFeatures from '../../components/landing/BentoFeatures.jsx';

import FaceCheckInSection from './FaceCheckInSection.jsx';
import Pricing from './Pricing.jsx';
import Contact from './Contact.jsx';
import TrustedBy from './TrustedBy.jsx';
import Testimonials from './Testimonials.jsx';
import FAQ from './FAQ.jsx';
import Footer from './Footer.jsx';

function LandingPage() {
  const scrollContainerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start start', 'end end']
  });

  return (
    <div ref={scrollContainerRef} className="App bg-[#000000] relative overflow-hidden">
      <Header />

      <Hero id="home" scrollYProgress={scrollYProgress} />

      <div className="space-y-0 relative z-10">
        <BentoFeatures id="our-story" />

        <FaceCheckInSection id="features" />
        <Pricing id="pricing" />
        <Testimonials />
        <FAQ id="faq" />
        <Contact id="contact" />
        <TrustedBy />
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;