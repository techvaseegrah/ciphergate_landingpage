import { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  footer,
  showCloseButton = true,
  customHeader
}) => {
  const modalRef = useRef(null);
  
  // Close modal on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Close if clicked outside the modal
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Modal size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-[95vw] lg:max-w-7xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop with blur effect */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            ref={modalRef}
            className={`bg-white rounded-[28px] shadow-2xl w-full ${sizeClasses[size]} overflow-hidden relative z-10 border border-slate-100`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {customHeader ? (
              customHeader
            ) : (
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
                {showCloseButton && (
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none cursor-pointer border-none"
                    onClick={onClose}
                  >
                    <FaTimes className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}
            
            {/* Modal Body */}
            <div className="px-8 py-6 max-h-[88vh] overflow-y-auto no-scrollbar">
              {children}
            </div>
            
            {/* Modal Footer */}
            {footer && (
              <div className="px-8 py-6 border-t border-slate-100 bg-white/80 backdrop-blur-sm flex justify-end space-x-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;