import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useScrollAnimation from '../../hooks/useScrollAnimation.js';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contact = ({ id }) => {
  const [contactRef, isVisible] = useScrollAnimation(0.1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Socket.IO is disabled for the frontend-only landing page to prevent connection errors
  /*
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);
  */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (value.length > 0 && socket) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing_start', { user: formData.firstName || 'User' });

        setTimeout(() => {
          setIsTyping(false);
          socket.emit('typing_stop');
        }, 2000);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (socket) {
        socket.emit('contact_message', {
          ...formData,
          id: Date.now() 
        });
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: ''
        });
      } else {
        toast.error(result.message || 'Error sending message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id={id} className="landing-section bg-[#000000] relative overflow-hidden pt-16 md:pt-32">
      {/* Decorative Atmosphere Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-[0.015] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-[0.015] blur-[150px] rounded-full pointer-events-none" />

      <div className="landing-container relative z-10">
        <div className="max-w-[1100px] mx-auto">
          {/* Header Section */}
          <motion.div
            ref={contactRef}
            className="flex flex-col items-center text-center mb-16 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="text-white"
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
              Inquiries
            </div>
            
            <h2 className="section-title mb-8">
              Get in <span className="text-white/40 font-normal">Touch</span>
            </h2>
            <p className="text-white text-[14px] md:text-[18px] max-w-[640px] mx-auto mb-10 md:mb-12 font-normal leading-relaxed opacity-90">
              Ready to transform your business? Contact us today for a personalized consultation.
            </p>
          </motion.div>

          {/* Contact Form Card - GLASSMORPHISM UPGRADE */}
          <motion.div
            className="glass-card-dark p-6 md:p-14 lg:p-20 rounded-[32px] md:rounded-[40px] overflow-hidden"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="relative z-10 space-y-8 md:space-y-12">
              <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-16">
                <div className="space-y-4">
                  <label className="block text-[14px] font-medium text-white mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border-b border-white/10 px-0 py-4 focus:border-white/40 transition-all duration-500 outline-none text-base md:text-lg tracking-tight text-white placeholder-gray-700"
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[14px] font-medium text-white mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border-b border-white/10 px-0 py-4 focus:border-white/40 transition-all duration-500 outline-none text-base md:text-lg tracking-tight text-white placeholder-gray-700"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[14px] font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/[0.03] border-b border-white/10 px-0 py-4 focus:border-white/40 transition-all duration-500 outline-none text-base md:text-lg tracking-tight text-white placeholder-gray-700"
                  placeholder="Email Address"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[14px] font-medium text-white mb-2">
                  Message
                </label>
                <textarea
                  rows="4"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full bg-white/[0.03] border-b border-white/10 px-0 py-4 focus:border-white/40 transition-all duration-500 outline-none text-base md:text-lg tracking-tight text-white resize-none placeholder-gray-700"
                  placeholder="Tell us about your project"
                ></textarea>
              </div>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="text-[11px] text-white/40 font-medium tracking-widest uppercase italic">
                  {typingUsers.map((user, index) => (
                    <span key={index}>{user} is typing...</span>
                  ))}
                </div>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`relative w-full group overflow-hidden py-5 bg-white text-black text-base font-semibold transition-all duration-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-transparent hover:text-white hover:border-white border border-white'}`}
                  style={{ clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)" }}
                >
                  <span className="relative z-10">{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;