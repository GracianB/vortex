export const MAX_RENDER_PIXELS = 8_000_000;
export const MAX_DEVICE_DPR = 2;

type RenderDprInput = {
  width: number;
  height: number;
  deviceDpr: number;
  maxTextureSize: number;
  pixelBudget?: number;
};

/**
 * Keeps the two trail framebuffers inside a predictable memory envelope while
 * respecting the GPU texture limit. This matters on high-DPI 4K/5K screens,
 * where blindly rendering at 2× can allocate hundreds of MB of trail buffers.
 */
export function resolveRenderDpr({
  width,
  height,
  deviceDpr,
  maxTextureSize,
  pixelBudget = MAX_RENDER_PIXELS,
}: RenderDprInput): number {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const native = Math.max(0.25, Math.min(deviceDpr || 1, MAX_DEVICE_DPR));
  const textureCap = Math.min(maxTextureSize / w, maxTextureSize / h);
  const pixelCap = Math.sqrt(pixelBudget / (w * h));

  return Math.max(0.25, Math.min(native, textureCap, pixelCap));
}
