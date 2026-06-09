export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'teraz';
  if (mins < 60) return `${mins} min temu`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} dni temu`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} tyg. temu`;
  return new Date(iso).toLocaleDateString('pl-PL');
}

// Stable accent color per source name.
const PALETTE = [
  '#6c5ce7', '#00b894', '#0984e3', '#e17055', '#e84393',
  '#fdcb6e', '#00cec9', '#a29bfe', '#fd79a8', '#55efc4',
];
export function sourceColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return String(n);
}
