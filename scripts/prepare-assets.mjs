import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('public/images', { recursive: true });
await mkdir('public/fonts', { recursive: true });

await Promise.all([
  sharp('assets/source/roof-house.png').resize({ width: 1536 }).webp({ quality: 86 }).toFile('public/images/roof-house.webp'),
  sharp('assets/source/roof-house.png').resize({ width: 768 }).webp({ quality: 82 }).toFile('public/images/roof-house-small.webp'),
  sharp('assets/source/roof-house.png').resize(900, 1080, { fit: 'cover', position: 'right' }).webp({ quality: 85 }).toFile('public/images/roof-detail.webp'),
]);

const families = [
  { query: 'Manrope:wght@200..800', name: 'manrope' },
  { query: 'Lora:ital,wght@1,400..700', name: 'lora-italic' },
];
for (const family of families) {
  const response = await fetch(`https://fonts.googleapis.com/css2?family=${family.query}&display=swap`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' },
  });
  if (!response.ok) throw new Error(`Font CSS request failed: ${response.status}`);
  const css = await response.text();
  for (const subset of ['latin-ext', 'latin']) {
    const block = css.split(`/* ${subset} */`)[1]?.split('}')[0];
    const url = block?.match(/url\(([^)]+)\)/)?.[1];
    if (!url) throw new Error(`Could not find ${family.name} ${subset}`);
    const fontResponse = await fetch(url);
    if (!fontResponse.ok) throw new Error(`Font file request failed: ${fontResponse.status}`);
    await writeFile(`public/fonts/${family.name}-${subset}.woff2`, Buffer.from(await fontResponse.arrayBuffer()));
  }
}
await Promise.all(['manrope', 'lora'].map(async (font) => {
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${font}/OFL.txt`);
  if (!license.ok) throw new Error(`Could not download ${font} license`);
  await writeFile(`public/fonts/${font}-OFL.txt`, await license.text());
}));
console.log('Optimized images and local fonts ready.');
