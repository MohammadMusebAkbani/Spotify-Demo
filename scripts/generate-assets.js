const fs = require("fs");
const zlib = require("zlib");

function createPng(width, height, r, g, b, a = 255) {
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const toCrc = Buffer.concat([typeBuf, data]);
    const crc = crc32(toCrc);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ (-1)) >>> 0;
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = makeChunk("IHDR", ihdrData);
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

fs.mkdirSync("merchants/clothes/assets", { recursive: true });
fs.mkdirSync("merchants/shoes/assets", { recursive: true });

// Clothes: warm brown/linen #8B5A2B -> 139, 90, 43
fs.writeFileSync("merchants/clothes/assets/icon.png", createPng(192, 192, 139, 90, 43));
fs.writeFileSync("merchants/clothes/assets/splash.png", createPng(400, 800, 253, 251, 247));
fs.writeFileSync("merchants/clothes/assets/logo.png", createPng(120, 40, 139, 90, 43));

// Shoes: slate blue #0F172A -> 15, 23, 42
fs.writeFileSync("merchants/shoes/assets/icon.png", createPng(192, 192, 15, 23, 42));
fs.writeFileSync("merchants/shoes/assets/splash.png", createPng(400, 800, 248, 250, 252));
fs.writeFileSync("merchants/shoes/assets/logo.png", createPng(120, 40, 2, 132, 199));

console.log("Created merchant assets successfully!");
