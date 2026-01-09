import React from 'react';

const Footer = () => {
  const socialIcons = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/techvaseegrah/',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-[#67748E] hover:bg-[#26D07C] hover:text-white transition-all duration-300 border border-gray-200 shadow-card hover:shadow-card-hover">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>
      )
    },
    {
      name: 'X',
      url: 'https://x.com/Tech_Vaseegrah',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-[#67748E] hover:bg-[#26D07C] hover:text-white transition-all duration-300 border border-gray-200 shadow-card hover:shadow-card-hover">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      )
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/people/Tech-Vaseegrah/61558676843990/',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-[#67748E] hover:bg-[#26D07C] hover:text-white transition-all duration-300 border border-gray-200 shadow-card hover:shadow-card-hover">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
          </svg>
        </div>
      )
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/tech-vaseegrah/posts/?feedView=all',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-[#67748E] hover:bg-[#26D07C] hover:text-white transition-all duration-300 border border-gray-200 shadow-card hover:shadow-card-hover">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </div>
      )
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@techvaseegrah',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-[#67748E] hover:bg-[#26D07C] hover:text-white transition-all duration-300 border border-gray-200 shadow-card hover:shadow-card-hover">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
        </div>
      )
    }
  ];

  return (
    <footer className="bg-transparent border-t border-gray-200/50 text-[#67748E] py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand and Description */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#26D07C] rounded-xl flex items-center justify-center shadow-lg shadow-[#26D07C]/20">
                <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
              </div>
              {/* CipherGate name with half black and half green effect */}
              <h1 className="text-xl font-extrabold font-poppins tracking-tight">
                <span className="bg-gradient-to-r from-black to-black bg-clip-text text-transparent">Cipher</span>
                <span className="bg-gradient-to-r from-green-500 to-green-500 bg-clip-text text-transparent">Gate</span>
              </h1>
            </div>
            <p className="text-[#67748E] text-base leading-relaxed">
              Building the future of digital experiences with innovative solutions.
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-2">
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:-translate-y-1 transition-transform duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-extrabold text-[#1A2B3C] mb-6 font-poppins">Product</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">Features</a></li>
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">Use Cases</a></li>
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">Updates</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-extrabold text-[#1A2B3C] mb-6 font-poppins">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">Documentation</a></li>
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">API Reference</a></li>
              <li><a href="#" className="text-base hover:text-[#26D07C] transition-colors duration-200">Community</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-extrabold text-[#1A2B3C] mb-6 font-poppins">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-base">
                <svg className="w-5 h-5 text-[#26D07C] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>techvaseegrah@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3 text-base">
                <svg className="w-5 h-5 text-[#26D07C] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>+91 85240 89733</span>
              </div>
              <div className="flex items-start space-x-3 text-base">
                <svg className="w-5 h-5 text-[#26D07C] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>9, Vijaya Nagar, Reddypalayam Road<br />Thanjavur-613009</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200/50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-base">
          <p>© 2026 CipherGate. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-6 mt-4 md:mt-0">
            <a href="/privacy-policy" className="hover:text-[#26D07C] transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-[#26D07C] transition-colors">Terms of Service</a>
            <a href="/security" className="hover:text-[#26D07C] transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;