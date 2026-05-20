import React from 'react';
import { motion } from 'framer-motion';

const BentoCard = ({ children, className = "" }) => (
  <motion.div
    className={`bento-card-premium rounded-[24px] p-7 flex flex-col group ${className}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="relative z-10 flex flex-col h-full">{children}</div>
  </motion.div>
);

const BentoFeatures = ({ id }) => {
  return (
    <section id={id} className="landing-section relative w-full bg-black overflow-hidden font-sans">
      <div className="main-wrapper relative z-10 flex flex-col items-center">

        {/* BADGE */}
        <motion.div
           style={{
             display: 'inline-flex', alignItems: 'center', gap: '8px',
             padding: '10px 18px', borderRadius: '14px',
             border: '1.5px solid rgba(255,255,255,0.15)',
             background: 'rgba(255,255,255,0.08)',
             backdropFilter: 'blur(16px)',
             boxShadow: 'inset 0 0 12px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
             marginBottom: '32px'
           }}
           initial={{ opacity: 0, y: 10 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
          <span className="text-[11px] font-bold text-white tracking-[0.14em] uppercase">Smarter System</span>
        </motion.div>

        {/* TITLE */}
        <motion.h2
          className="section-title mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Design With Purpose<br />Built With Impact.
        </motion.h2>

        {/* SUBTITLE */}
        <motion.p
          className="text-center text-white text-[14px] md:text-base max-w-[440px] mb-12 md:mb-16 font-light leading-relaxed px-4 md:px-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          We Help Companies Track Smart, Work Fast
        </motion.p>

        {/* BENTO GRID */}
        <div className="features-grid-flat">

          {/* 1. Total Company Control — tall, col 1, spans 2 rows */}
          <BentoCard className="card-tall">
            <div className="rounded-xl overflow-hidden aspect-[16/10] mb-5 border border-white/5 relative">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600"
                alt="Office Control"
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            <div className="separator-line" />
            <h3 className="text-white text-lg font-semibold mb-2">Total Company Control</h3>
            <p className="text-white/80 text-[13px] leading-relaxed font-light">
              We monitor not just employees but the entire company operations, ensuring smooth performance and complete control.
            </p>
          </BentoCard>

          {/* 2. 15+ Projects Delivered — col 2, row 1 */}
          <BentoCard>
            <div className="mb-4 opacity-90">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
            </div>
            <div className="separator-line" />
            <h3 className="text-white text-lg font-semibold mb-2">15+ Projects Delivered</h3>
            <p className="text-white/60 text-[13px] leading-relaxed font-light">
              Successfully delivering high-quality solutions with proven results and client satisfaction
            </p>
          </BentoCard>

          {/* 3. Seamless Digital Integration — tall, col 3, spans 2 rows */}
          <BentoCard className="card-tall">
            <div className="relative h-48 mb-5 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <img
                    src="/logo.png"
                    alt="CipherGate Logo"
                    className="w-16 h-16 object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 160" fill="none">
                  <path d="M85 65 L120 65 L140 35 L180 35" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                  <path d="M85 80 L120 80 L155 80 L185 80" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                  <path d="M85 95 L120 95 L145 120 L185 120" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                  <circle cx="180" cy="35" r="2" fill="rgba(255,255,255,0.5)" />
                  <circle cx="185" cy="80" r="2" fill="rgba(255,255,255,0.5)" />
                  <circle cx="185" cy="120" r="2" fill="rgba(255,255,255,0.5)" />
                </svg>
                <div className="absolute right-4 top-3 opacity-60">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="absolute right-4 bottom-2 opacity-60">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="18" rx="2" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="separator-line" />
            <h3 className="text-white text-lg font-semibold mb-2">Seamless Digital Integration</h3>
            <p className="text-white/60 text-[13px] leading-relaxed font-light">
              Unify your platforms to streamline processes and enhance productivity
            </p>
          </BentoCard>

          {/* 4. Round the Clock Support — col 2, row 2 */}
          <BentoCard>
            <div className="mb-4 opacity-80">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </div>
            <div className="separator-line" />
            <h3 className="text-white text-lg font-semibold mb-2">Round the Clock Support</h3>
            <p className="text-white/60 text-[13px] leading-relaxed font-light">
              We provide round the clock assistance ensuring your systems run smoothly without interruptions anytime
            </p>
          </BentoCard>

          {/* 5. Role-Based Secure Access — col 1, row 3 */}
          <BentoCard>
            <div className="flex -space-x-3 mb-5">
              {[
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
              ].map((src, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-black overflow-hidden relative z-[5]">
                  <img src={src} alt="Team Member" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="separator-line" />
            <h3 className="text-white text-lg font-semibold mb-1">Role-Based Secure Access</h3>
          </BentoCard>

          {/* 6. Centralized Control Dashboard — col 2, row 3 */}
          <BentoCard>
            <div className="h-28 flex items-end gap-1.5 mb-5">
              {[45, 75, 55, 95, 65, 50, 85, 60, 100, 70, 45, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bar-chart-gradient rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="separator-line" />
            <h3 className="text-white text-lg font-semibold mb-1">Centralized Control Dashboard</h3>
          </BentoCard>

          {/* 7. Smart Face Attendance — col 3, row 3 */}
          <BentoCard>
            <div className="mb-4 opacity-80">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3H5C3.89543 3 3 3.89543 3 5V7M17 3H19C20.1046 3 21 3.89543 21 5V7M7 21H5C3.89543 21 3 20.1046 3 19V17M17 21H19C20.1046 21 21 20.1046 21 19V17"/>
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="separator-line" />
            <h3 className="text-white text-lg font-semibold mb-2">Smart Face Attendance</h3>
            <p className="text-white/60 text-[13px] leading-relaxed font-light">
              Effortlessly track employee presence using advanced facial recognition for real-time accuracy
            </p>
          </BentoCard>

        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
