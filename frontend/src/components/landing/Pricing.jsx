import React from 'react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();
  
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small businesses getting started with facial recognition technology.',
      features: [
        'Up to 50 users',
        'Basic facial recognition',
        'Email support',
        'Standard analytics',
        'Mobile app access'
      ],
      cta: 'Get Started',
      popular: false,
      // Custom classes for the watercolor effect and basic styling
      cardClass: 'bg-white',
      headerClass: 'text-teal-600',
      priceClass: 'text-teal-600',
      buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white',
      plusButtonColor: 'bg-teal-500' // Color for the plus button
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'Ideal for growing businesses that need advanced features and support.',
      features: [
        'Up to 250 users',
        'Advanced facial recognition',
        'Priority support',
        'Advanced analytics',
        'Mobile app access',
        'Custom integrations'
      ],
      cta: 'Try Free for 14 Days',
      popular: true,
      // Custom classes for the watercolor effect and professional styling
      cardClass: 'bg-white',
      headerClass: 'text-gray-900',
      priceClass: 'text-gray-900',
      buttonClass: 'bg-black hover:bg-purple-700 text-white',
      plusButtonColor: 'bg-gray-900' // Color for the plus button
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      description: 'For large organizations with complex security requirements.',
      features: [
        'Unlimited users',
        'Premium facial recognition',
        '24/7 dedicated support',
        'Real-time analytics',
        'Mobile app access',
        'Custom integrations',
        'On-premise deployment',
        'Advanced security features'
      ],
      cta: 'Contact Sales',
      popular: false,
      // Custom classes for the watercolor effect and enterprise styling
      cardClass: 'bg-white',
      headerClass: 'text-red-600',
      priceClass: 'text-red-600',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
      plusButtonColor: 'bg-red-500' // Color for the plus button
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen flex items-center justify-center font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. All plans include our core facial recognition features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-3xl shadow-xl p-0 pt-16 flex flex-col justify-between transform transition-all duration-500 hover:scale-105 ${plan.cardClass}`}
              style={{ minHeight: '580px', overflow: 'hidden' }} // Ensure cards have a consistent height and hide overflow for watercolor
            >
              {/* Watercolor header */}
              <div 
                className="absolute top-0 left-0 w-full h-40 rounded-t-3xl opacity-70"
                style={{ 
                  backgroundImage: `url(${index === 0 ? 'https://res.cloudinary.com/dt3k2apqp/image/upload/v1721666993/teal-watercolor_y7l7u5.png' : index === 1 ? 'https://res.cloudinary.com/dt3k2apqp/image/upload/v1721666993/purple-watercolor_h0uubk.png' : 'https://res.cloudinary.com/dt3k2apqp/image/upload/v1721666993/red-watercolor_vgsxrx.png'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0% 100%)' // Angled bottom edge for the watercolor
                }}
              ></div>

              {/* Plan name over watercolor */}
              <div className="absolute top-6 left-0 w-full text-center z-10">
                <h3 className={`text-4xl font-extrabold text-white drop-shadow-md`}>
                  {plan.name === 'Starter' ? 'basic' : plan.name === 'Professional' ? 'pro' : 'mid'}
                </h3>
              </div>
              
              <div className="relative z-20 flex flex-col items-center justify-between h-full pt-12 pb-8 px-6">
                <div className="text-center w-full">
                  <div className="mb-6">
                    <span className={`text-6xl font-extrabold block ${plan.priceClass} drop-shadow-sm`}>{plan.price}</span>
                    <span className="text-lg text-gray-500 opacity-90">{plan.period}</span>
                  </div>
                  <p className="text-md mb-8 text-gray-600 leading-relaxed">{plan.description}</p>
                  
                  <ul className="space-y-4 mb-10 text-left text-gray-700">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-lg">
                        <svg className={`h-6 w-6 ${plan.priceClass} mr-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-auto w-full flex justify-center">
                  <button
                    onClick={() => {
                      if (plan.name === 'Professional') {
                        navigate('/admin/register');
                      } else if (plan.name === 'Enterprise') {
                        navigate('/admin/register');
                      } else {
                        navigate('/admin/register');
                      }
                    }}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg ${plan.plusButtonColor}`}
                    style={{
                        zIndex: 30, // Ensure the button is above everything
                        top: '20px', // Adjust position to match the image
                    }}
                  >
                    {plan.name === 'Professional' ? 
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                      : 
                      <span className="leading-none">+</span>
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;