const fs = require("fs");
const path = require("path");

const root = __dirname;
const galleryDir = path.join(root, "Images", "gallery");
const heroDir = path.join(root, "Videos", "hero");
const outputFile = path.join(root, "media-config.js");

const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const videoExts = new Set([".mp4", ".webm", ".mov"]);
const sizePattern = ["large", "tall", "wide", "small", "small", "wide", "small", "small"];

function listFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(fullPath, extensions);
      if (!entry.isFile()) return [];
      return extensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
    })
    .sort((a, b) => a.localeCompare(b));
}

function toSitePath(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function titleFromFilename(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const cleaned = base
    .replace(/\d+$/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Campus Life";

  return cleaned.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function captionFromTitle(title) {
  if (/independence day/i.test(title)) {
    return "A proud celebration of freedom, unity, and school spirit.";
  }
  if (/assembly|prayer/i.test(title)) {
    return "A calm and meaningful start to the school day.";
  }
  if (/sport/i.test(title)) {
    return "Teamwork, energy, and healthy competition on campus.";
  }
  return "Moments from learning and school life at Pinnacle.";
}

const gallery = listFiles(galleryDir, imageExts).map((filePath, index) => {
  const title = titleFromFilename(filePath);
  return {
    title,
    caption: captionFromTitle(title),
    image: toSitePath(filePath),
    size: sizePattern[index % sizePattern.length],
  };
});

const heroVideos = listFiles(heroDir, videoExts).map(toSitePath);

const config = {
  heroVideos: [],
  gallery,
};

const fileText = `window.PINNACLE_MEDIA_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
fs.writeFileSync(outputFile, fileText, "utf8");

console.log(`Generated ${toSitePath(outputFile)}`);
console.log(`Gallery items: ${gallery.length}`);
console.log(`Hero videos found but disabled: ${heroVideos.length}`);
