/**
 * MotionMade — Video Compression Script
 * Compresses MP4s and converts MOV → MP4 using H.264 at CRF 28 (visually lossless).
 * Original files are untouched. Output files have the same name with .mp4 extension.
 *
 * Run: node compress-video.js
 */

const ffmpegPath = require('ffmpeg-static');
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const imagesDir = path.join(__dirname, 'images');

const videos = [
  {
    input:  path.join(imagesDir, 'plukt', 'Plukt_video.mp4'),
    output: path.join(imagesDir, 'plukt', 'Plukt_video-opt.mp4'),
  },
  {
    input:  path.join(imagesDir, 'silmachy_cosmetics', 'Silmachy_video.mp4'),
    output: path.join(imagesDir, 'silmachy_cosmetics', 'Silmachy_video-opt.mp4'),
  },
  {
    input:  path.join(imagesDir, 'spirulina_nord', 'Spirulina_video.mov'),
    output: path.join(imagesDir, 'spirulina_nord', 'Spirulina_video.mp4'),  // MOV → MP4
  },
];

for (const { input, output } of videos) {
  if (!fs.existsSync(input)) {
    console.log(`  SKIP (not found): ${path.basename(input)}`);
    continue;
  }

  if (fs.existsSync(output)) {
    const srcMtime = fs.statSync(input).mtimeMs;
    const outMtime = fs.statSync(output).mtimeMs;
    if (outMtime >= srcMtime) {
      console.log(`  SKIP (up to date): ${path.basename(output)}`);
      continue;
    }
  }

  const srcSize = fs.statSync(input).size;
  console.log(`  Compressing: ${path.basename(input)} (${(srcSize / 1024 / 1024).toFixed(1)} MB) ...`);

  try {
    // -crf 28: good quality, ~50-70% smaller; use 23 for higher quality
    // -preset fast: balance speed vs compression
    // -movflags +faststart: moov atom at front so video can start playing immediately (critical for web)
    // -vf scale=-2:1080: cap at 1080p if taller; -2 keeps aspect ratio even
    // -an for services card (autoplay, muted) — keep audio just in case; it's muted in HTML
    const cmd = [
      `"${ffmpegPath}"`,
      `-i "${input}"`,
      `-c:v libx264`,
      `-crf 28`,
      `-preset fast`,
      `-profile:v high`,
      `-pix_fmt yuv420p`,
      `-vf "scale='min(iw,1920)':'min(ih,1080)':force_original_aspect_ratio=decrease"`,
      `-movflags +faststart`,
      `-c:a aac`,
      `-b:a 128k`,
      `-y`,
      `"${output}"`,
    ].join(' ');

    execSync(cmd, { stdio: 'pipe' });

    const outSize = fs.statSync(output).size;
    const saving  = ((1 - outSize / srcSize) * 100).toFixed(1);
    console.log(`  ✓  ${path.basename(input)} → ${path.basename(output)}`);
    console.log(`     ${(srcSize / 1024 / 1024).toFixed(1)} MB → ${(outSize / 1024 / 1024).toFixed(1)} MB  (saved ${saving}%)\n`);
  } catch (err) {
    console.error(`  ✗  ${path.basename(input)}: ${err.message}\n`);
  }
}

console.log('Done. Update HTML video src attributes to use the -opt.mp4 versions.');
