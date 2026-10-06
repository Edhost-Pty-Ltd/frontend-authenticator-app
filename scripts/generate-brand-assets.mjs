import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'images');

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function blend(base, mark, coverage) {
  const amount = Math.max(0, Math.min(1, coverage));
  return [
    Math.round(base[0] + (mark[0] - base[0]) * amount),
    Math.round(base[1] + (mark[1] - base[1]) * amount),
    Math.round(base[2] + (mark[2] - base[2]) * amount),
    Math.round(base[3] + (255 - base[3]) * amount),
  ];
}

function draw(size, { background, mark }) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size * 0.6;
  const radius = size * 0.2;
  const stroke = size * 0.046;
  const dot = size * 0.034;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.hypot(dx, dy);
      const arc = dy <= stroke * 0.45 ? stroke / 2 + 1.1 - Math.abs(dist - radius) : 0;
      const center = dot + 1.1 - dist;
      const [r, g, b, a] = blend(background, mark, Math.max(arc, center));
      const index = (y * size + x) * 4;
      rgba[index] = r;
      rgba[index + 1] = g;
      rgba[index + 2] = b;
      rgba[index + 3] = a;
    }
  }
  return rgba;
}

const deep = [20, 63, 58, 255];
const foam = [244, 241, 234, 255];
const clear = [0, 0, 0, 0];
const ink = [16, 33, 31, 255];

fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(path.join(root, 'icon.png'), encodePng(1024, 1024, draw(1024, { background: deep, mark: foam })));
fs.writeFileSync(path.join(root, 'favicon.png'), encodePng(64, 64, draw(64, { background: deep, mark: foam })));
fs.writeFileSync(path.join(root, 'android-icon-background.png'), encodePng(1024, 1024, draw(1024, { background: deep, mark: deep })));
fs.writeFileSync(path.join(root, 'android-icon-foreground.png'), encodePng(1024, 1024, draw(1024, { background: clear, mark: foam })));
fs.writeFileSync(path.join(root, 'android-icon-monochrome.png'), encodePng(1024, 1024, draw(1024, { background: clear, mark: ink })));
fs.writeFileSync(path.join(root, 'splash-icon.png'), encodePng(512, 512, draw(512, { background: clear, mark: foam })));
console.log('brand assets written');
