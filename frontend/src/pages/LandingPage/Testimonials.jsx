import React from 'react';

const TestimonialCard = ({ quote, name, role, rating, image }) => (
  <div className="bg-[#111111] border border-[#222] rounded-[24px] p-6 flex flex-col md:flex-row gap-6 hover:border-[#333] transition-colors duration-300">
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="text-white text-3xl mb-4 font-serif leading-none">“</div>
        <p className="text-[#a0a0a0] text-sm md:text-[15px] leading-relaxed mb-6 font-poppins">
          "{quote}"
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div>
          <h4 className="text-white font-semibold text-[15px]">{name}</h4>
          <p className="text-[#666] text-[11px] font-medium tracking-wide uppercase mt-1">{role}</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-[14px] h-[14px] ${i < Math.floor(rating) ? 'text-white' : 'text-white/50'}`} fill="currentColor" viewBox="0 0 20 20">
              {i < Math.floor(rating) ? (
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              ) : (
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              )}
              {i === Math.floor(rating) && rating % 1 !== 0 && (
                <path fill="url(#halfGrad)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              )}
            </svg>
          ))}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="halfGrad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="white" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
    <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] shrink-0 self-center md:self-stretch my-auto">
      <img src={image} alt={name} className="w-full h-full object-cover rounded-[16px]" />
    </div>
  </div>
);

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Our attendance management has never been this smooth! The face recognition system is fast, accurate, and secure. It's made time tracking so much easier for our team.",
      name: "Khesav Raj",
      role: "Co-founder of Jhonsons",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
      quote: "The experience has been outstanding! From accuracy to speed, every feature works flawlessly and saves us valuable time every day.",
      name: "Charlette",
      role: "CEO of sykas",
      rating: 4,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
      quote: "The experience has been outstanding! From accuracy to speed, every feature works flawlessly and saves us valuable time every day.",
      name: "Ye Wenjie",
      role: "CEO of Hundabar Icecreams",
      rating: 5,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
      quote: "Our workflow has never been this efficient! The system is incredibly intuitive, fast, and reliable. It's completely transformed how our team operates.",
      name: "Nikitha Vijay",
      role: "Admin of GCC Groups",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=400"
    }
  ];

  return (
    <section className="bg-[#000000] py-24 border-t border-white/5 font-poppins relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-[#161616] mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[10px] font-bold text-white tracking-[0.1em] uppercase">Testimonials</span>
          </div>
          <h2 className="title-gradient text-[34px] md:text-[46px] lg:text-[56px] font-medium tracking-tight leading-[1.1]">
            Hear It From Those Who Matters Most
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={idx} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
