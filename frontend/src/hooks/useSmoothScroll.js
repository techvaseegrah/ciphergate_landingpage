import { useEffect } from 'react';

const useSmoothScroll = () => {
  useEffect(() => {
    const handleSmoothScroll = (e) => {
      // Check if the clicked element is an anchor link
      if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Calculate offset to account for fixed header
          const offsetTop = targetElement.offsetTop - 100; // Adjust for header height
        
          // Smooth scrolling with custom easing for slower, more pleasant animation
          const start = window.pageYOffset;
          const distance = offsetTop - start;
          const duration = 1200; // Increased duration for slower scroll
          let startTime = null;

          const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Custom easing function for smoother animation
            const easeInOutQuart = progress < 0.5 
              ? 8 * progress * progress * progress * progress 
              : 1 - Math.pow(-2 * progress + 2, 4) / 2;
            
            window.scrollTo(0, start + distance * easeInOutQuart);
            
            if (progress < 1) {
              requestAnimationFrame(animation);
            }
          };
          
          requestAnimationFrame(animation);
        }
      }
    };

    // Add event listener to the document to handle all clicks on anchor links
    document.addEventListener('click', handleSmoothScroll);

    // Clean up the event listener
    return () => {
      document.removeEventListener('click', handleSmoothScroll);
    };
  }, []);
};

export default useSmoothScroll;