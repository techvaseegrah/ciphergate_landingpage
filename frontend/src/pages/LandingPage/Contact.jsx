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
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
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
    <section id="contact" className="py-24 md:py-32 bg-[#fafafa]">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6">
        {/* Header Section */}
        <motion.div
          ref={contactRef}
          className="text-center mb-16 md:mb-20 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span
            className="inline-block border border-gray-200 text-gray-500 text-[10px] md:text-[11px] font-medium tracking-[0.25em] uppercase px-4 py-2 mb-6 bg-white"
          >
            Inquiries
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-widest text-gray-900 uppercase leading-[1.2] mb-6">
            Get in <span className="text-[#B76E79]">Touch</span>
          </h2>
          <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed tracking-wide">
            Ready to transform your business? Contact us today for a personalized consultation.
          </p>
        </motion.div>

        {/* Contact Form Card */}
        <motion.div
          className="bg-white p-5 sm:p-10 md:p-14 border border-gray-200"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666]">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 focus:border-[#111] focus:bg-white transition-colors duration-400 outline-none text-sm tracking-wide text-[#111]"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666]">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 focus:border-[#111] focus:bg-white transition-colors duration-400 outline-none text-sm tracking-wide text-[#111]"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666]">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 focus:border-[#111] focus:bg-white transition-colors duration-400 outline-none text-sm tracking-wide text-[#111]"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666]">
                Message
              </label>
              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 focus:border-[#111] focus:bg-white transition-colors duration-400 outline-none text-sm tracking-wide text-[#111] resize-none"
                placeholder="Tell us about your project"
              ></textarea>
            </div>

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="text-[10px] text-[#B76E79] font-medium tracking-wide">
                {typingUsers.map((user, index) => (
                  <span key={index}>{user} is typing...</span>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#111] text-white text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-400 border border-[#111] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-transparent hover:text-[#111]'}`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </motion.div>

        {/* Company Logos Section */}
        <motion.div
          className="mt-24 md:mt-32 border-t border-gray-200 pt-16 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        >
          <h3 className="text-[10px] font-medium text-gray-400 text-center uppercase tracking-[0.3em] mb-12">
            Trusted by Leading Companies
          </h3>
          <div className="relative overflow-hidden py-4 w-full">
            <div className="flex animate-loop-scroll whitespace-nowrap">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-shrink-0 mx-6 md:mx-12">
                  <img
                    src={`/company${(i % 4) + 1}.png`}
                    alt={`Company ${(i % 4) + 1}`}
                    className="h-6 md:h-10 object-contain transition-all duration-500"
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