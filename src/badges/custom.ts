import { widths } from './character-widths';
import { colors } from './colors';

export function getBadge(value: any, label: string = 'Readme visits'): string {
  return getFlatBadge(`${value}`, label);
}

function getFlatBadge(value: string, label: string, color: string = 'green', labelColor: string = '#555'): string {
  label = sanitizeText(label);
  value = sanitizeText(value);
  color = colors[color] || color;
  labelColor = colors[labelColor] || labelColor
  const title = `${label}: ${value}`
  const sbTextStart = 50;
  const sbTextWidth = getTextWidth(label);
  const stTextWidth = getTextWidth(value);
  const sbRectWidth = sbTextWidth + 100;
  const stRectWidth = stTextWidth + 100;
  const width = sbRectWidth + stRectWidth;
  return `
    <svg width="${width / 10}" height="20" aria-label="${title}" viewBox="0 0 ${width} 200" xmlns="http://www.w3.org/2000/svg" role="img">
      <title>${title}</title>
      <g>
        <rect fill="${labelColor}" width="${sbRectWidth}" height="200"/>
        <rect fill="${color}" x="${sbRectWidth}" width="${stRectWidth}" height="200"/>
      </g>
      <g aria-hidden="true" fill="#fff" text-anchor="start" font-family="Verdana,DejaVu Sans,sans-serif" font-size="110">
        <text x="${sbTextStart + 10}" y="148" textLength="${sbTextWidth}" fill="#000" opacity="0.1">${label}</text>
        <text x="${sbTextStart}" y="138" textLength="${sbTextWidth}">${label}</text>
        <text x="${sbRectWidth + 55}" y="148" textLength="${stTextWidth}" fill="#000" opacity="0.1">${value}</text>
        <text x="${sbRectWidth + 45}" y="138" textLength="${stTextWidth}">${value}</text>
      </g>
    </svg>
  `;
}

function sanitizeText(text: string): string {
  return text
    .replace(/\u0026/g, '&amp;')
    .replace(/\u003C/g, '&lt;')
    .replace(/\u003E/g, '&gt;')
    .replace(/\u0022/g, '&quot;')
    .replace(/\u0027/g, '&apos;')
}

function getTextWidth(text: string): number {
  const defaultWidth = widths[64];
  let charWidth = 0;
  return [...text].reduce((width, char) => {
    charWidth = char.charCodeAt(0);
    return width + (charWidth === undefined ? defaultWidth : charWidth);
  }, 0);
}


