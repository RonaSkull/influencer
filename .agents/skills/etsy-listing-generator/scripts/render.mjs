#!/usr/bin/env node
/**
 * Etsy Listing Image Generator
 * 
 * Usage:
 *   node render.mjs <template> <image-url> <title> <subtitle> <badge> <output>
 *   node render.mjs --batch <template> <csv-or-json> <output-dir>
 * 
 * Single: Renders one listing image from a template + data.
 * Batch:  Renders multiple listings from a JSON array file.
 * 
 * JSON format for batch:
 *   [{ "file": "image-url", "title": "...", "subtitle": "...", "badge": "..." }, ...]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args[0] === '--batch') {
  await batchRender(args[1], args[2], args[3]);
} else {
  await singleRender(args[0], args[1], args[2], args[3], args[4], args[5]);
}

async function singleRender(templatePath, imageUrl, title, subtitle, badge, outputFile) {
  let html = fs.readFileSync(templatePath, 'utf-8');
  
  // Extract canvas dimensions from template
  const widthMatch = html.match(/width:\s*(\d+)px/);
  const heightMatch = html.match(/height:\s*(\d+)px/);
  const width = widthMatch ? parseInt(widthMatch[1]) : 1400;
  const height = heightMatch ? parseInt(heightMatch[1]) : 2000;
  
  html = html.replace('PRODUCT_IMAGE_URL', imageUrl);
  html = html.replace('TITLE_TEXT', title);
  html = html.replace('SUBTITLE_TEXT', subtitle);
  html = html.replace('BADGE_LEFT_TEXT', badge);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: outputFile, type: 'png' });
  await browser.close();
  console.log(`✅ ${outputFile}`);
}

async function batchRender(templatePath, dataFile, outputDir) {
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const stories = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  
  const widthMatch = templateHtml.match(/width:\s*(\d+)px/);
  const heightMatch = templateHtml.match(/height:\s*(\d+)px/);
  const width = widthMatch ? parseInt(widthMatch[1]) : 1400;
  const height = heightMatch ? parseInt(heightMatch[1]) : 2000;
  
  fs.mkdirSync(outputDir, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  let done = 0;
  
  for (const story of stories) {
    let html = templateHtml;
    html = html.replace('PRODUCT_IMAGE_URL', story.file || story.image || story.url);
    html = html.replace('TITLE_TEXT', story.title || 'Bible Story Puppet Printables');
    html = html.replace('SUBTITLE_TEXT', story.subtitle || story.name || '');
    html = html.replace('BADGE_LEFT_TEXT', story.badge || '12 ELEMENTS + 4 BACKGROUNDS');

    const outName = story.output || `${(story.name || story.subtitle || `image-${done}`).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-listing.png`;
    
    const page = await browser.newPage();
    await page.setViewportSize({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, outName), type: 'png' });
    await page.close();
    done++;
    console.log(`[${done}/${stories.length}] ${outName}`);
  }

  await browser.close();
  console.log(`\n✅ Done! ${done} listings generated in ${outputDir}`);
}
