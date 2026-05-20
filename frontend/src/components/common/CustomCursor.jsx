import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(true); // Default to dark since our landing is mostly black
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Premium Elastic Physics (Spring config for 0.08-0.12s feel)
  const springConfig = { 
    damping: 35, 
    stiffness: 400, 
    mass: 0.8,
    restDelta: 0.001 
  };
  
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleHover = (e) => {
      const target = e.target;
      const clickable = target.closest('button, a, .cursor-pointer') || 
                       getComputedStyle(target).cursor === 'pointer';
      setIsHovering(!!clickable);

      // Simple background color detection logic
      let current = target;
      while (current && current !== document.body) {
        const bg = getComputedStyle(current).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          const rgb = bg.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            setIsDarkBg(brightness < 128);
          }
          break;
        }
        current = current.parentElement;
      }
    };

    const mouseDown = () => setIsClicked(true);
    const mouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseover', handleHover);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, [mouseX, mouseY]);

  if (typeof window !== 'undefined' && window.innerWidth <= 768) return null;

  return (
    <>
      <style>{`
        * { cursor: none !important; }
      `}</style>

      {/* New High-Contrast Precision Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        {/* Trailing Luxury Halo */}
        <motion.div
          animate={{
            scale: isClicked ? 0.8 : (isHovering ? 1.6 : 1),
            opacity: isHovering ? 0.4 : 0.2,
          }}
          transition={{
            type: 'spring',
            stiffness: 250,
            damping: 30,
            mass: 0.8
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '0.8px solid #FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            mixBlendMode: 'difference'
          }}
        />

        {/* Center Precision Dot */}
        <motion.div
          animate={{
            scale: isHovering ? 1.5 : 1,
            backgroundColor: '#FFFFFF',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
            mixBlendMode: 'difference'
          }}
        />

        {/* Subtle expansion ripple on click */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '40px',
                height: '40px',
                border: '1px solid #FFFFFF',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default CustomCursor;
