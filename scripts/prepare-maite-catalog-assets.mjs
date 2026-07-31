import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const output = path.join(root, "public", "images", "maite");

const assets = [
  {
    input: "assets/ambassadors/maite/campaign-01/maite-softshell-snow-ugc-v2.png",
    output: "maite-softshell-austral-snow.webp",
    width: 1200,
  },
  {
    input: "assets/ambassadors/maite/campaign-01/maite-polar-termo-cabin-ugc-v2.png",
    output: "maite-polar-lenga-refugio.webp",
    width: 1200,
  },
  {
    input: "assets/ambassadors/maite/campaign-01/maite-poleron-refugio-selfie-ugc-v1.png",
    output: "maite-retrato-refugio.webp",
    width: 1000,
  },
  {
    input: "assets/design/mujer-capsula-01/pudu-softshell-austral-mujer-v1.png",
    output: "softshell-austral-ficha.webp",
    width: 1600,
  },
  {
    input: "assets/design/mujer-capsula-01/pudu-softshell-austral-mujer-v1.png",
    output: "softshell-austral-packshot.webp",
    width: 760,
    extract: { left: 0, top: 0, width: 610, height: 1024 },
  },
  {
    input: "assets/design/mujer-capsula-01/pudu-polar-lenga-mujer-v1.png",
    output: "polar-lenga-ficha.webp",
    width: 1600,
  },
  {
    input: "assets/design/mujer-capsula-01/pudu-polar-lenga-mujer-v1.png",
    output: "polar-lenga-packshot.webp",
    width: 760,
    extract: { left: 0, top: 0, width: 610, height: 1024 },
  },
  {
    input: "assets/design/mujer-capsula-01/pudu-mujer-capsula-lineup-v2.png",
    output: "capsula-mujer-lineup.webp",
    width: 1600,
  },
];

await mkdir(output, { recursive: true });

for (const asset of assets) {
  const pipeline = sharp(path.join(root, asset.input));
  if (asset.extract) pipeline.extract(asset.extract);
  await pipeline
    .resize({ width: asset.width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(output, asset.output));
}

console.log(`Prepared ${assets.length} optimized catalog assets in ${output}`);
