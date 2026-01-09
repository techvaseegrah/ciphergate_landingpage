import React from 'react';

const FuturisticBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-[#F9FAFB]">
      {/* Soft Mint Gradient Circles */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary-green/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-primary-green/5 blur-[100px] rounded-full" />
      
      {/* Decorative Leaf Elements */}
      <img src="/leaf-left.png" className="absolute top-[20%] left-[2%] w-32 opacity-20 animate-float" alt="" />
      <img src="/leaf-right.png" className="absolute bottom-[20%] right-[2%] w-40 opacity-20 animate-float" style={{ animationDelay: '1s' }} alt="" />
    </div>
  );
};

export default FuturisticBackground;