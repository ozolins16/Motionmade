/**
 * Updates all image src references in HTML files to use .webp versions.
 * Run once: node update-webp.js
 */
const fs = require('fs');
const path = require('path');

const htmlFiles = [
  path.join(__dirname, 'index.html'),
  path.join(__dirname, 'portfolio.html'),
];

// All replacements: [from, to]
const replacements = [
  // home images
  ['images/home-1.png',  'images/home-1.webp'],
  ['images/home-2.png',  'images/home-2.webp'],
  ['images/home-3.png',  'images/home-3.webp'],
  ['images/home-4.png',  'images/home-4.webp'],
  ['images/home-5.png',  'images/home-5.webp'],
  ['images/home-7.png',  'images/home-7.webp'],
  ['images/home-8.PNG',  'images/home-8.webp'],
  ['images/home-9.png',  'images/home-9.webp'],
  // silmachy
  ['images/silmachy_cosmetics/SC6500.png', 'images/silmachy_cosmetics/SC6500.webp'],
  ['images/silmachy_cosmetics/SC6501.png', 'images/silmachy_cosmetics/SC6501.webp'],
  ['images/silmachy_cosmetics/SC6502.png', 'images/silmachy_cosmetics/SC6502.webp'],
  ['images/silmachy_cosmetics/SC6503.png', 'images/silmachy_cosmetics/SC6503.webp'],
  ['images/silmachy_cosmetics/SC6504.png', 'images/silmachy_cosmetics/SC6504.webp'],
  // plukt
  ['images/plukt/P6502.png', 'images/plukt/P6502.webp'],
  ['images/plukt/P6503.png', 'images/plukt/P6503.webp'],
  ['images/plukt/P6522.png', 'images/plukt/P6522.webp'],
  ['images/plukt/P6523.png', 'images/plukt/P6523.webp'],
  ['images/plukt/P6531.png', 'images/plukt/P6531.webp'],
  // spirulina
  ['images/spirulina_nord/SN6512.PNG', 'images/spirulina_nord/SN6512.webp'],
  ['images/spirulina_nord/SN6601.PNG', 'images/spirulina_nord/SN6601.webp'],
  ['images/spirulina_nord/SP6703.png', 'images/spirulina_nord/SP6703.webp'],
  ['images/spirulina_nord/SP6705.png', 'images/spirulina_nord/SP6705.webp'],
  ['images/spirulina_nord/SP6706.png', 'images/spirulina_nord/SP6706.webp'],
];

for (const filePath of htmlFiles) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  for (const [from, to] of replacements) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      changes++;
      console.log(`  ${path.basename(filePath)}: ${from} → ${to}`);
    }
  }
  if (changes > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✓ ${path.basename(filePath)} updated (${changes} replacements)\n`);
  } else {
    console.log(`  — ${path.basename(filePath)}: no changes needed\n`);
  }
}

console.log('Done.');
