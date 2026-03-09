import React from 'react';

const TrustedBy = () => {
  // Use the actual logos from your image
  const partners = [
    { name: 'Company One', src: '/company1.png' },
    { name: 'Company Two', src: '/company2.png' },
    { name: 'Company Three', src: '/company3.png' },
    { name: 'Company Four', src: '/company4.png' },
  ];

  return (
    <div className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <h3 className="text-center text-slate-400 text-xs font-bold uppercase tracking-[0.5em] mb-12">
          Trusted by Leading Companies
        </h3>

        {/* 
           1. MASK: This 'relative' div acts as the window. 
           The 'before' and 'after' gradients make it look professional by fading the edges.
        */}
        <div className="relative flex overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 md:before:w-40 before:bg-gradient-to-r before:from-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 md:after:w-40 after:bg-gradient-to-l after:from-white after:to-transparent">

          {/* 
             2. THE TRACK: 
             - 'flex' layout
             - 'w-max': Forces the container to be as wide as all logos combined
             - 'animate-loop-scroll': Runs the -50% translation from your config
          */}
          <div className="flex w-max animate-loop-scroll">

            {/* 
               3. NO GAP LOGIC: 
               Render the list TWICE. 
               Set 1 + Set 2 = 100% width. 
               Animation moves to -50% (exactly the end of Set 1).
               The reset is invisible = Non-stop movement.
            */}
            {[...partners, ...partners].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center px-8 md:px-16"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="h-10 md:h-14 w-auto object-contain transition-all duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;