import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    question: "What do we do ?",
    answer: "We provide a cutting-edge facial recognition attendance system that automates time tracking, improves accuracy, and enhances security. Our solution simplifies the attendance process by replacing manual clock-ins with fast, secure, and reliable face scanning technology. This helps businesses save time, reduce errors, and boost productivity."
  },
  {
    question: "How do I get Started ?",
    answer: "Getting started is simple. Register for an administrative account, invite your team, and they can instantly begin logging attendance securely using our web or mobile interfaces."
  },
  {
    question: "How does facial recognition for attendance work ?",
    answer: "The system captures an encrypted mathematical map of facial features and compares it securely in real-time against registered profiles, confirming identity in milliseconds without storing any identifiable photos."
  },
  {
    question: "Do I need any special hardware or equipment ?",
    answer: "No specialized hardware is required. Any standard smartphone camera, webcam, or tablet with internet access can function as an attendance terminal."
  },
  {
    question: "What happens if an employee's face isn't recognized ?",
    answer: "In the rare event of a failed scan (e.g. poor lighting), employees have quick alternative methods such as PIN entry, or a manual check-in request with manager approval."
  }
];

const FAQ = ({ id }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const navigate = useNavigate();

  return (
    <section id={id} className="landing-section bg-[#000000] font-poppins relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col items-start pt-8">
            <div 
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '14px',
                border: '1.5px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 0 12px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
                marginBottom: '40px'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
              <span className="text-[11px] font-bold text-white tracking-[0.14em] uppercase">FAQ</span>
            </div>
            
            <h2 className="text-left flex flex-col items-start gap-1"
              style={{ fontSize: '56px', lineHeight: '1.1', fontWeight: 600, color: '#FFFFFF', wordBreak: 'break-word' }}>
              <span className="block">Your Questions?</span>
              <span className="block" style={{ color: 'rgba(255,255,255,0.48)' }}>We Answered!</span>
            </h2>

            <div className="mt-20">
              <h4 className="text-white font-semibold text-lg mb-2">Still have a question?</h4>
              <p className="text-[#a0a0a0] mb-8 max-w-sm text-sm md:text-[15px] font-light">
                We're here whenever you need us.<br />Always ready to help.
              </p>
              <button 
                onClick={() => navigate('/contact')} 
                className="px-6 py-3 bg-white text-black font-brand text-[15px] font-semibold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors duration-300"
                style={{ clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)" }}
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Column - Accordion */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`border border-[#1f1f1f] rounded-[16px] overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-[#111111]' : 'bg-[#000000] hover:bg-[#0a0a0a]'}`}
                >
                  <button 
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full text-left px-5 py-5 sm:px-6 sm:py-6 flex items-center justify-between focus:outline-none"
                  >
                    <span className="text-white font-medium text-[15px] sm:text-[17px] pr-4">{faq.question}</span>
                    <motion.svg 
                      animate={{ rotate: isOpen ? 180 : 0 }} 
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-gray-400 shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-[#a0a0a0] leading-relaxed font-light text-[14px]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQ;
