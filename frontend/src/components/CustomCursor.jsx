import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !dotRef.current || !ringRef.current) return;

    // Movement Logic
    const moveCursor = (e) => {
      const { clientX, clientY } = e;
      
      // Near-instant dot tracking
      gsap.to(dotRef.current, {
        x: clientX,
        y: clientY,
        duration: 0.1,
        ease: 'power2.out'
      });

      // Fluid trailing ring (0.35s duration for luxury feel)
      gsap.to(ringRef.current, {
        x: clientX,
        y: clientY,
        duration: 0.35,
        ease: 'power3.out'
      });
    };

    // Interaction Logic (Delegated)
    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = target.closest('button, a, input, textarea, [role="button"], .interactive-hover');
      
      if (isInteractive) {
        gsap.to(ringRef.current, {
          scale: 1.8,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.6)',
          duration: 0.4,
          ease: 'expo.out'
        });
        gsap.to(dotRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.2
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      const isInteractive = target.closest('button, a, input, textarea, [role="button"], .interactive-hover');
      
      if (isInteractive) {
        gsap.to(ringRef.current, {
          scale: 1,
          backgroundColor: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          duration: 0.4,
          ease: 'expo.out'
        });
        gsap.to(dotRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.3
        });
      }
    };

    const handleMouseDown = () => {
      gsap.to(ringRef.current, { scale: 0.8, duration: 0.2 });
    };

    const handleMouseUp = () => {
      gsap.to(ringRef.current, { scale: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="hidden md:block">
      {/* Precision Dot */}
      <div 
        ref={dotRef}
        style={{ 
          position: 'fixed', top: 0, left: 0,
          width: '6px', height: '6px',
          marginLeft: '-3px', marginTop: '-3px',
          borderRadius: '50%', background: 'white',
          pointerEvents: 'none', zIndex: 10000,
          mixBlendMode: 'difference',
          willChange: 'transform'
        }} 
      />
      
      {/* Fluid Trailing Ring */}
      <div 
        ref={ringRef}
        style={{ 
          position: 'fixed', top: 0, left: 0,
          width: '32px', height: '32px',
          marginLeft: '-16px', marginTop: '-16px',
          borderRadius: '50%', border: '1.2px solid rgba(255, 255, 255, 0.4)',
          pointerEvents: 'none', zIndex: 9999,
          mixBlendMode: 'difference',
          willChange: 'transform'
        }} 
      />
    </div>
  );
};

export default CustomCursor;
