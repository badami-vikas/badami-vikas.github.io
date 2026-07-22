export function backgroundAlpha(red, green, blue, alpha) {
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  if (high - low > 18) return alpha;
  const lightness = (red + green + blue) / 3;
  if (lightness >= 248) return 0;
  if (lightness <= 220) return alpha;
  const retained = (248 - lightness) / 28;
  return Math.round(alpha * retained);
}

function isMattePixel(data, offset) {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
  return data[offset + 3] > 0 && chroma < 28 && (red + green + blue) / 3 > 198;
}

export function stripConnectedBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const enqueue = (pixel) => {
    if (visited[pixel] || !isMattePixel(data, pixel * 4)) return;
    visited[pixel] = 1;
    queue[tail++] = pixel;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    data[pixel * 4 + 3] = 0;
    if (x > 0) enqueue(pixel - 1);
    if (x < width - 1) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y < height - 1) enqueue(pixel + width);
  }
  return data;
}

const cache = new Map();

export function prepareAsset(src, inset = 3) {
  if (cache.has(src)) return cache.get(src);
  const pending = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth - inset * 2;
      const height = image.naturalHeight - inset * 2;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, inset, inset, width, height, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height);
      stripConnectedBackground(pixels.data, width, height);
      context.putImageData(pixels, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = reject;
    image.src = src;
  });
  cache.set(src, pending);
  return pending;
}
