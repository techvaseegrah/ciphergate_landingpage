import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { label: '₹40,000', tag: 'Enterprise', color: '#111111', glow: 'rgba(0,0,0,0.05)' },
  { label: '₹30,000', tag: 'Advanced', color: '#333333', glow: 'rgba(0,0,0,0.05)' },
  { label: '₹20,000', tag: 'Standard', color: '#555555', glow: 'rgba(0,0,0,0.05)' },
  { label: '₹10,000', tag: 'Starter', color: '#777777', glow: 'rgba(0,0,0,0.05)' },
];

const websites = [
  { id: 1, name: 'Sweet Hub', url: '#', category: '₹40,000', description: 'E-commerce bakery with catalog & ordering', image: '/basic-package.png' },
  { id: 3, name: 'Sharurecreationclub', url: '#', category: '₹40,000', description: 'Club hub with events & membership', image: '/Premium-Package.png' },
  { id: 2, name: 'Ashurastribe', url: '#', category: '₹30,000', description: 'Community portal with dynamic content', image: '/Standard-Package.png' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

const Features = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCat = categories[activeIdx];
  const filtered = websites.filter((w) => w.category === activeCat.label);

  return (
    <section
      id="features"
      style={{
        background: '#fafafa',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #eaeaea',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            border: '1px solid #d1d5db',
            color: '#6b7280',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            backgroundColor: '#ffffff'
          }}>
            Our <span style={{ color: '#B76E79' }}>Build</span> Websites
          </span>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 300,
            color: '#111827',
            lineHeight: 1.1,
            margin: '0 auto 24px',
            letterSpacing: '0.05em'
          }}>
            Our{' '}
            <span style={{ fontWeight: 400, color: '#B76E79' }}>
              Build
            </span>{' '}
            Websites
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '15px',
            maxWidth: '500px',
            margin: '0 auto',
            fontWeight: 300,
            lineHeight: 1.8,
            letterSpacing: '0.02em'
          }}>
            Handcrafted digital experiences tailored for every budget and business goal.
          </p>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '60px' }}>
          {categories.map((cat, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 24px', cursor: 'pointer',
                  border: isActive ? '1px solid #111' : '1px solid #e5e7eb',
                  background: isActive ? '#111' : '#fff',
                  color: isActive ? '#fff' : '#6b7280',
                  fontWeight: 400, fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'all 0.4s ease',
                  borderRadius: '0'
                }}
              >
                {cat.label}
                <span style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  background: isActive ? '#333' : '#f3f4f6',
                  color: isActive ? '#fff' : '#9ca3af',
                  letterSpacing: '0.05em'
                }}>
                  {cat.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeIdx}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2px', // Thin grid line effect
                background: '#e5e7eb',
                border: '1px solid #e5e7eb'
              }}
            >
              {filtered.map((site, i) => (
                <WebsiteCard key={site.id} site={site} index={i} cat={activeCat} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${activeIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '100px 24px',
                border: '1px solid #e5e7eb', background: '#fff'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '18px', fontWeight: 400, color: '#111827',
                  margin: '0 0 16px', letterSpacing: '0.1em', textTransform: 'uppercase'
                }}>
                  Coming Soon
                </h3>
                <p style={{
                  fontSize: '14px', color: '#6b7280', margin: 0, maxWidth: '340px',
                  lineHeight: 1.8, fontWeight: 300, letterSpacing: '0.02em'
                }}>
                  We're crafting exciting new projects for the{' '}
                  <span style={{ color: '#111827', fontWeight: 500 }}>
                    {activeCat.tag}
                  </span>{' '}
                  package. Check back soon.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

const WebsiteCard = ({ site, index, cat }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor-text="VISIT SITE"
      style={{
        background: '#ffffff',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', height: '300px', overflow: 'hidden', flexShrink: 0, padding: '32px', backgroundColor: '#fafafa' }}>
        <img
          src={site.image}
          alt={site.name}
          style={{
            width: '100%', height: '100%', objectFit: 'contain',
            filter: hovered ? 'grayscale(0%)' : 'grayscale(100%)',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            opacity: hovered ? 1 : 0.8
          }}
        />
        {/* Subtle overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
          transition: 'background 0.8s ease',
        }} />

        {/* Price badge */}
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#ffffff',
          padding: '6px 14px',
          fontSize: '11px', fontWeight: 500, color: '#111',
          letterSpacing: '0.1em', border: '1px solid #e5e7eb'
        }}>
          {cat.label}
        </div>
      </div>

      {/* Card Body */}
      <div style={{
        padding: '32px 24px',
        display: 'flex', flexDirection: 'column',
        flex: 1,
        background: hovered ? '#fafafa' : '#ffffff',
        transition: 'background 0.4s ease'
      }}>
        <h3 style={{
          fontWeight: 400,
          fontSize: '18px',
          color: '#111827',
          margin: '0 0 12px 0',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          {site.name}
        </h3>

        <p style={{
          color: '#6b7280',
          fontSize: '13px',
          fontWeight: 300,
          lineHeight: 1.6,
          margin: '0 0 32px 0',
          flex: 1
        }}>
          {site.description}
        </p>

        {/* CTA Button */}
        <a
          href={site.url}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 'max-content',
            padding: '12px 24px',
            background: hovered ? '#111' : 'transparent',
            border: hovered ? '1px solid #111' : '1px solid #d1d5db',
            color: hovered ? '#fff' : '#4b5563',
            fontWeight: 400,
            fontSize: '11px',
            textDecoration: 'none',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            transition: 'all 0.4s ease',
          }}
        >
          View Live Site
        </a>
      </div>
    </motion.div>
  );
};

export default Features; 