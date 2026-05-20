const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(([search, replace]) => {
    const regex = typeof search === 'string' 
      ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      : search;
    content = content.replace(regex, replace);
  });
  fs.writeFileSync(file, content);
};

const useCaseFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/UseCase.jsx';
replaceInFile(useCaseFile, [
  ['bg-[#0a0a0a]', 'bg-[#000000]'],
  ['bg-[#111111]', 'bg-[#000000]'],
  ['bg-[#111]', 'bg-[#000000]'],
  ['bg-[#1a1a1a]', 'bg-[#000000]'],
]);

const contactFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Contact.jsx';
replaceInFile(contactFile, [
  ['bg-[#0a0a0a]', 'bg-[#000000]'],
  ['bg-[#111111]', 'bg-[#000000]'],
  ['bg-[#111]', 'bg-[#000000]'],
  ['bg-[#1a1a1a]', 'bg-[#000000]'],
]);

const parallaxFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/ParallaxImage.jsx';
replaceInFile(parallaxFile, [
  ['bg-[#0a0a0a]', 'bg-[#000000]'],
  ['bg-[#111111]', 'bg-[#000000]'],
  ['bg-[#111]', 'bg-[#000000]'],
  ['bg-[#1a1a1a]', 'bg-[#000000]'],
]);

const bentoFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/components/landing/BentoFeatures.jsx';
// Bento uses some custom classes but it should be fine. Maybe it has some bg colors? Let's aggressively replace if needed.

// Pricing images
const pricingPage = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Pricing.jsx';
replaceInFile(pricingPage, [
  ['src="/Frametb.png"', 'src="/Frametb 1.png"']
]);

const pricingComp = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/components/landing/Pricing.jsx';
replaceInFile(pricingComp, [
  ['src="/Frametb.png"', 'src="/Frametb 1.png"']
]);

console.log('Final #000000 updates complete');
