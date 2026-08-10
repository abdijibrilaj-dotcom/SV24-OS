const PALETTE = [
  { bg: "#EFF6FF", fg: "#2563EB" },
  { bg: "#ECFDF5", fg: "#15803D" },
  { bg: "#EEF2FF", fg: "#4338CA" },
  { bg: "#FFFBEB", fg: "#B45309" },
  { bg: "#FDF2F8", fg: "#BE185D" },
  { bg: "#F0FDFA", fg: "#0F766E" },
];

export function avatarColor(seed: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
