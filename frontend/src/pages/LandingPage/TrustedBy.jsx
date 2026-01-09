import React from 'react';

const TrustedBy = () => {
  // Model: Using the real company names from your image
  const partners = [
    { name: 'The Sweet Hub', src: '/the-sweet-hub-color.png' }, // Original: Red/Gold
    { name: 'Bee Design', src: '/bee-design-color.png' },       // Original: Blue/Black
    { name: 'CP Architects', src: '/cp-architects-color.png' }, // Original: Professional Blue/Gray
    { name: 'Delta Brand', src: '/delta-pooja-color.png' },     // Original: Saffron/Red
    { name: 'CP Abstract', src: '/cp-abstract-color.png' },
  ];

  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-sm font-bold text-slate-400 text-center uppercase tracking-[0.3em] mb-12">
          Trusted by Leading Companies
        </h3>

        <div className="relative flex overflow-hidden">
          {/* 
            'animate-loop-scroll' handles the non-stop movement.
            We remove the 'grayscale' class to show original colors.
          */}
          <div className="flex whitespace-nowrap animate-loop-scroll">
            
            {/* Doubling the array ensures the loop never gaps or jumps */}
            {[...partners, ...partners].map((partner, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 px-12 md:px-20"
              >
                <img 
                  src={partner.src} 
                  alt={partner.name} 
                  /* 
                     Removed 'grayscale' to show original colors.
                     Added 'opacity-80 hover:opacity-100' so they look 
                     clean but pop when the user hovers over them.
                  */
                  className="h-10 md:h-12 w-auto object-contain transition-all duration-300 opacity-80 hover:opacity-100" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;