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
    <div className="py-12 bg-[#000000] overflow-hidden border-t font-poppins border-white/5">
      <div className="landing-container">
        {/* Section Title */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <div 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '14px',
              border: '1.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              boxShadow: 'inset 0 0 12px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
              marginBottom: '32px'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
            <span className="text-[11px] font-bold text-white tracking-[0.14em] uppercase">Partners</span>
          </div>
          <h2 className="section-title">
            Trusted by Leading Companies
          </h2>
        </div>

        {/* Unified Continuous Loop Marquee */}
        <div className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 md:before:w-40 before:bg-gradient-to-r before:from-[#000000] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 md:after:w-40 after:bg-gradient-to-l after:from-[#000000] after:to-transparent">
          <div className="logos-grid-container flex w-max animate-loop-scroll items-center group">
             {[...partners, ...partners, ...partners, ...partners, ...partners, ...partners].map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  <img 
                    src={logo.src} 
                    alt={logo.name} 
                    className="small-logo" 
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