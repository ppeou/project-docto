#!/usr/bin/env node

/**
 * Script to generate app icons from SVG source
 * Requires: sharp (npm install --save-dev sharp)
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'public', 'icon.svg');
const publicDir = join(__dirname, 'public');
const iconsDir = join(publicDir, 'icons');

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
];

async function generateIcons() {
  try {
    const svgBuffer = readFileSync(svgPath);
    
    console.log('Generating icons...');
    
    for (const { name, size } of sizes) {
      const outputPath = name.startsWith('icon-') 
        ? join(iconsDir, name)
        : join(publicDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    // Generate favicon.ico (multi-resolution ICO file with 16x16 and 32x32)
    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toBuffer();
    
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // Create ICO file with multiple resolutions
    await sharp(favicon32)
      .resize(32, 32)
      .toFile(join(publicDir, 'favicon.ico'));
    
    console.log('✓ Generated favicon.ico');
    
    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

