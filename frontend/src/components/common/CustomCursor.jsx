import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [hoverText, setHoverText] = useState('');
    const [displayText, setDisplayText] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isDarkBg, setIsDarkBg] = useState(false);

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const mouseLeave = () => {
            setIsVisible(false);
            setHoverText('');
        };

        const mouseEnter = () => {
            setIsVisible(true);
        };

        const handleMouseOver = (e) => {
            const target = e.target;

            // Check for dark background
            let element = target;
            let isDark = false;
            while (element && element !== document.documentElement) {
                const bg = window.getComputedStyle(element).backgroundColor;
                if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                    const rgb = bg.match(/\d+/g);
                    if (rgb && rgb.length >= 3) {
                        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                        isDark = brightness < 128;
                        break;
                    }
                }
                element = element.parentElement;
            }
            setIsDarkBg(isDark);

            // Determine what we're hovering over
            const isButtonOrLink =
                target.tagName.toLowerCase() === 'button' ||
                target.closest('button') ||
                target.tagName.toLowerCase() === 'a' ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer';

            const isImageOrVideo =
                target.tagName.toLowerCase() === 'img' ||
                target.closest('img') ||
                target.tagName.toLowerCase() === 'video' ||
                target.closest('video');

            const cursorTextElement = target.closest('[data-cursor-text]');

            if (cursorTextElement) {
                const text = cursorTextElement.getAttribute('data-cursor-text');
                setHoverText(text);
                setDisplayText(text);
            } else if (isImageOrVideo) {
                setHoverText('VIEW');
                setDisplayText('VIEW');
            } else if (isButtonOrLink) {
                setHoverText('CLICK');
                setDisplayText('CLICK');
            } else {
                setHoverText('');
            }
        };

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseout", mouseLeave);
        window.addEventListener("mouseover", handleMouseOver);
        document.documentElement.addEventListener('mouseenter', mouseEnter);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseout", mouseLeave);
            window.removeEventListener("mouseover", handleMouseOver);
            document.documentElement.removeEventListener('mouseenter', mouseEnter);
        };
    }, [isVisible]);

    // Don't show cursor on very small screens (mobile devices)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        return null;
    }

    return (
        <>
            <style>{`
        @media (min-width: 769px) {
          * {
            cursor: none !important;
          }
        }
      `}</style>

            {/* Main Cursor Ring (Always same size) */}
            <motion.div
                className={`fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[999998] flex items-center justify-center transition-colors duration-300 ${isDarkBg ? 'bg-white opacity-100' : 'border border-[#111] opacity-50'}`}
                animate={{
                    x: mousePosition.x - 8,
                    y: mousePosition.y - 8,
                    opacity: isVisible ? 1 : 0
                }}
                transition={{
                    x: { duration: 0 },
                    y: { duration: 0 },
                    opacity: { duration: 0.2 }
                }}
            />

            {/* Floating Tag */}
            <motion.div
                className={`fixed top-0 left-0 pointer-events-none z-[999999] px-3 py-1.5 rounded-full text-[9px] font-medium tracking-[0.2em] uppercase shadow-md flex items-center justify-center whitespace-nowrap transition-colors duration-300 ${isDarkBg ? 'bg-white text-[#111]' : 'bg-[#111] text-white'}`}
                animate={{
                    opacity: hoverText && isVisible ? 1 : 0,
                    scale: hoverText && isVisible ? 1 : 0.8,
                    x: mousePosition.x + 20,
                    y: mousePosition.y - 8,
                    rotate: hoverText && isVisible ? [-5, 5, -5] : 0
                }}
                transition={{
                    x: { duration: 0 },
                    y: { duration: 0 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                    rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
            >
                {displayText || 'CLICK'}
            </motion.div>
        </>
    );
};

export default CustomCursor;
