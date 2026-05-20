const fs = require('fs');

const filesToUpdate = [
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Hero.jsx',
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/components/landing/BentoFeatures.jsx',
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/StreamlineSection.jsx',
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/UseCase.jsx',
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/ParallaxImage.jsx',
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Pricing.jsx',
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/components/landing/Pricing.jsx',
  'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Contact.jsx',
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace <h1 className="..." or <h2 className="..."
    // by injecting ' title-gradient ' right after 'className="'
    content = content.replace(/(<(?:h1|h2|motion\.h1|motion\.h2)[^>]*className=")([^"]*)(")/g, '$1title-gradient $2$3');
    
    fs.writeFileSync(file, content);
  }
});
console.log('Done!');
