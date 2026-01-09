import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useScrollAnimation from '../../hooks/useScrollAnimation.js';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contact = () => {
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

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });

    // Listen for new contact messages
    newSocket.on('new_contact_message', (data) => {
      console.log('New contact message received:', data);
      toast.success('Your message has been received! We will get back to you soon.');
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => [...prev, data.user]);
    });

    newSocket.on('user_stopped_typing', () => {
      setTypingUsers([]);
    });

    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Emit typing event
    if (value.length > 0 && socket) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing_start', { user: formData.firstName || 'User' });

        // Stop typing after 2 seconds of inactivity
        setTimeout(() => {
          setIsTyping(false);
          socket.emit('typing_stop');
        }, 2000);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
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
      // Emit real-time message event
      if (socket) {
        socket.emit('contact_message', {
          ...formData,
          id: Date.now() // temporary ID
        });
      }

      // Submit to backend API
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
    <section id="contact" className="py-20 bg-transparent">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          ref={contactRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A2B3C] mb-6 font-poppins tracking-tight">
            Get in <span className="text-[#26D07C]">Touch</span>
          </h2>
          <p className="text-lg text-[#67748E] max-w-2xl mx-auto leading-relaxed">
            Ready to transform your business? Contact us today for a personalized consultation.
          </p>
        </motion.div>

        {/* Contact Form Card - Updated with Travigo Styles */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-card border border-gray-200/50"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <label className="block text-sm font-semibold text-[#1A2B3C] ml-1 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#26D07C] focus:border-[#26D07C] transition-all duration-300 outline-none text-[#1A2B3C] placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="block text-sm font-semibold text-[#1A2B3C] ml-1 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#26D07C] focus:border-[#26D07C] transition-all duration-300 outline-none text-[#1A2B3C] placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-[#1A2B3C] ml-1 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#26D07C] focus:border-[#26D07C] transition-all duration-300 outline-none text-[#1A2B3C] placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-[#1A2B3C] ml-1 mb-2">
                Message
              </label>
              <textarea
                rows="4"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your project"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#26D07C] focus:border-[#26D07C] transition-all duration-300 outline-none text-[#1A2B3C] placeholder:text-gray-400 resize-none"
              ></textarea>
            </div>

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="text-sm text-[#26D07C] font-medium">
                {typingUsers.map((user, index) => (
                  <span key={index}>{user} is typing...</span>
                ))}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#26D07C] hover:bg-[#1eb36a] hover:shadow-xl hover:shadow-[#26D07C]/30'} text-white`}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </motion.button>
          </form>
        </motion.div>

        {/* Company Logos Section - KEEPING YOUR IMAGE LOGIC AND ANIMATION */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-sm font-bold text-gray-400 text-center uppercase tracking-widest mb-10">
            Trusted by Leading Companies
          </h3>
          <div className="relative overflow-hidden py-4">
            <div className="flex animate-loop-scroll">
              {/* Keeping your exact original logic for the 20 logos */}
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-shrink-0 mx-6 md:mx-10">
                  <img
                    src={`/company${(i % 4) + 1}.png`}
                    alt={`Company ${(i % 4) + 1}`}
                    className="h-10 md:h-12 object-contain opacity-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;