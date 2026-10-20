const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Remove outdated package-lock.json if it was locked to old Expo 44
const lockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(lockPath)) {
  try {
    const lockContent = fs.readFileSync(lockPath, 'utf8');
    if (lockContent.includes('44.0.6')) {
      fs.unlinkSync(lockPath);
      console.log('[Setup] Removed degraded package-lock.json to restore modern Expo 51');
    }
  } catch (e) {}
}

// Create a valid, standalone PNG buffer of any dimensions and color
function createPngBuffer(width, height, r, g, b, a = 255) {
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(lineSize * height);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineSize;
    rawData[lineOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = lineOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);

    return Buffer.concat([len, typeAndData, crc]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const orangePng = createPngBuffer(48, 48, 234, 88, 12);
const splashPng = createPngBuffer(200, 200, 234, 88, 12);

const files = {
  'favicon.png': orangePng,
  'icon.png': orangePng,
  'adaptive-icon.png': orangePng,
  'notification-icon.png': orangePng,
  'splash.png': splashPng
};

for (const [filename, buf] of Object.entries(files)) {
  const filePath = path.join(assetsDir, filename);
  fs.writeFileSync(filePath, buf);
  console.log(`[Asset Generator] Created ${filename} (${buf.length} bytes)`);
}

console.log('[Asset Generator] All assets generated successfully!');
