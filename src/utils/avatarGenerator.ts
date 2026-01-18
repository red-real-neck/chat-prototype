/**
 * Generates an avatar SVG similar to GitLab's approach
 * - Takes initials from the first letters of words
 * - Generates background color based on name hash
 * - Returns SVG as a data URL
 */

const colors = [
  '#E75E40', '#F2C94C', '#F2994A', '#EB5757', '#9B51E0',
  '#56CCF2', '#2F80ED', '#219653', '#6FCF97', '#27AE60'
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2); // Max 2 initials
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function generateAvatar(name: string, size: number = 40): string {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  const textColor = '#FFFFFF';
  const fontSize = Math.floor(size * 0.4);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size * 0.2}" ry="${size * 0.2}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}