/*
 * svg.mjs — shared pieces for the illustrations in words/art.mjs and
 * unit<N>/art.mjs. Every drawing is 128×128, transparent, flat, in fixed
 * colours (so it works on light and dark pages), with a <title>.
 *
 *   svg(title, body)    a complete SVG file; `title` is read by screen readers
 *   OUTLINE             stroke attributes for the dark outline every shape has
 *   COLOUR              the palette drawings share: { ink, white, cream,
 *                       red, orange, yellow, green, teal, blue, purple,
 *                       pink, brown, tan, grey }
 *   shadow(cx, cy, rx)  a soft ground shadow under a thing
 *   glass(drink)        a tall glass at the centre, filled with `drink`
 *                       (a colour; null for empty)
 *   clockFace(hour, minute, { cx, cy, r })
 *                       an analogue clock showing that time, centred on
 *                       cx, cy (default the middle) with radius r (default 40)
 *   sky(colour, ground, inTheSky)
 *                       a rounded scene tile filling the picture: `colour`
 *                       above, `inTheSky` (a sun, the moon), then a strip of
 *                       `ground` colour along the bottom (from y 96) in
 *                       front of it, all clipped to the tile
 */

export const COLOUR = {
  ink: '#3a2a30', white: '#ffffff', cream: '#fff4dc',
  red: '#e53935', orange: '#fb8c00', yellow: '#fdd835', green: '#43a047', teal: '#00897b',
  blue: '#1e88e5', purple: '#8e24aa', pink: '#ec407a', brown: '#8d5524', tan: '#d7a86e', grey: '#9e9e9e',
};

export const OUTLINE = `stroke="${COLOUR.ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

const escapeXml = text => text.replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]));

export const svg = (title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><title>${escapeXml(title)}</title>${body}</svg>\n`;

export const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${Math.round(rx / 6)}" fill="${COLOUR.ink}" opacity=".15"/>`;

export function glass(drink) {
  const contents = drink ? `<path d="M42 50 L86 50 L82 108 L46 108 Z" fill="${drink}"/>` : '';
  return `${shadow(64, 116, 28)}${contents}
    <path d="M38 20 L90 20 L83 112 L45 112 Z" fill="${COLOUR.white}" fill-opacity=".35" ${OUTLINE}/>
    <path d="M48 28 L46 96" stroke="${COLOUR.white}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
}

export function clockFace(hour, minute = 0, { cx = 64, cy = 64, r = 40 } = {}) {
  const handEnd = (turns, length) => {
    const angle = turns * 2 * Math.PI - Math.PI / 2;
    return `${(cx + length * Math.cos(angle)).toFixed(1)} ${(cy + length * Math.sin(angle)).toFixed(1)}`;
  };
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * 2 * Math.PI;
    const point = fraction => `${(cx + r * fraction * Math.cos(angle)).toFixed(1)} ${(cy + r * fraction * Math.sin(angle)).toFixed(1)}`;
    return `M${point(0.78)} L${point(0.9)}`;
  }).join(' ');
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLOUR.white}" ${OUTLINE}/>
    <path d="${ticks}" stroke="${COLOUR.ink}" stroke-width="${Math.max(1.5, r / 16)}" stroke-linecap="round"/>
    <path d="M${cx} ${cy} L${handEnd(((hour % 12) + minute / 60) / 12, r * 0.5)}" stroke="${COLOUR.ink}" stroke-width="${Math.max(2.5, r / 9)}" stroke-linecap="round"/>
    <path d="M${cx} ${cy} L${handEnd(minute / 60, r * 0.75)}" stroke="${COLOUR.ink}" stroke-width="${Math.max(2, r / 14)}" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="${Math.max(2, r / 12)}" fill="${COLOUR.red}"/>`;
}

export const sky = (colour, ground, inTheSky) => `<clipPath id="tile"><rect x="6" y="6" width="116" height="116" rx="18"/></clipPath>
  <g clip-path="url(#tile)"><rect x="0" y="0" width="128" height="128" fill="${colour}"/>${inTheSky}<rect x="0" y="96" width="128" height="32" fill="${ground}"/></g>
  <rect x="6" y="6" width="116" height="116" rx="18" fill="none" ${OUTLINE}/>`;
