const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(([search, replace]) => {
    const regex = typeof search === 'string' 
      ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      : search;
    content = content.replace(regex, replace);
  });
  
  // Specific regex replacements
  content = content.replace(/bg-white/g, 'bg-[#0a0a0a]');
  content = content.replace(/border-gray-200/g, 'border-[#222]');
  content = content.replace(/border-gray-100/g, 'border-[#222]');
  content = content.replace(/bg-\[\#fafafa\]/g, 'bg-[#111]');
  content = content.replace(/text-gray-900/g, 'text-gray-100');
  
  fs.writeFileSync(file, content);
};

const useCaseFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/UseCase.jsx';
replaceInFile(useCaseFile, [
  ['bg-[#0a0a0a]/95', 'bg-[#000000]/95'],
  ['text-[#111]', 'text-white'],
  ['group-hover:bg-black', 'group-hover:bg-white'],
  ['group-hover:text-black', 'group-hover:text-[#000]'],
  ['bg-gray-300', 'bg-[#333]'],
]);

const contactFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Contact.jsx';
replaceInFile(contactFile, [
  ['bg-[#111] text-white', 'bg-white text-black'],
  ['hover:bg-transparent hover:text-[#111]', 'hover:bg-transparent hover:text-white'],
  ['focus:border-[#111] focus:bg-[#0a0a0a]', 'focus:border-gray-500 focus:bg-[#1a1a1a]'],
  ['text-[#111]', 'text-white'],
  ['hover:text-[#111]', 'hover:text-white'],
]);

const parallaxFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/ParallaxImage.jsx';
replaceInFile(parallaxFile, [
  ['text-[#111]', 'text-white'],
  ['hover:text-[#111]', 'hover:text-white'],
  ['border-[#111]', 'border-gray-600'],
  ['hover:border-[#111]', 'hover:border-gray-400'],
  ['bg-[#111]', 'bg-[#1a1a1a]'],
  ['text-black', 'text-white'],
]);

const heroFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Hero.jsx';
replaceInFile(heroFile, [
  // already dark, but let's make sure bg-white button doesn't become #0a0a0a
]);

const headerFile = 'c:/Users/Administrator/Desktop/cil/ciphergate_landingpage/frontend/src/pages/LandingPage/Header.jsx';
let headerContent = fs.readFileSync(headerFile, 'utf8');
headerContent = headerContent.replace(/background-color: #fafafa;/g, 'background-color: #111;');
headerContent = headerContent.replace(/border: 1px solid #e5e5e5;/g, 'border: 1px solid #333;');
headerContent = headerContent.replace(/background-color: #ffffff;/g, 'background-color: #000;');
headerContent = headerContent.replace(/border-color: #111;/g, 'border-color: #fff;');
headerContent = headerContent.replace(/bg-white/g, 'bg-[#0a0a0a]');
headerContent = headerContent.replace(/border-gray-100/g, 'border-[#222]');
headerContent = headerContent.replace(/bg-gray-50/g, 'bg-[#111]');
headerContent = headerContent.replace(/border-gray-200/g, 'border-[#222]');
headerContent = headerContent.replace(/text-\[\#111\]/g, 'text-white');
headerContent = headerContent.replace(/hover:text-\[\#111\]/g, 'hover:text-white');
headerContent = headerContent.replace(/hover:bg-gray-100/g, 'hover:bg-[#222]');
headerContent = headerContent.replace(/bg-\[\#f4f4f4\]/g, 'bg-white');
headerContent = headerContent.replace(/text-black/g, 'text-black');
headerContent = headerContent.replace(/hover:bg-gray-200/g, 'hover:bg-gray-300');
fs.writeFileSync(headerFile, headerContent);

console.log('Update complete');
