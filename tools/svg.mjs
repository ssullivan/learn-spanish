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
 *
 * People (unit 3's pronouns and jobs):
 *   person(x, y, { shirt, hair, old, scale, face })
 *                       a person from the chest up, head centred on x, y
 *                       (radius 12, shoulders down to y + 44), scaled by
 *                       `scale`. shirt: a COLOUR name, or null for a grey
 *                       bystander; hair: 'short' (default), 'long' or
 *                       'none'; old: white hair; face: true draws eyes and a
 *                       smile (for a person drawn large, on their own)
 *   pointingArm(points, shirt, finger)
 *                       an arm through `points` ([[x, y], ...], shoulder to
 *                       hand) in a `shirt` sleeve, its finger pointing
 *                       along `finger` ([dx, dy]); draw it after its person
 *   ring(x1, y1, x2, y2) a gold ring around a box: marks who is meant
 *   speechBubble(tailX, tailY)
 *                       a speech bubble in the top-left corner, its tail
 *                       pointing at tailX, tailY (the speaker's mouth)
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

const SKIN = '#f2c9a0', SKIN_LINE = '#b07a52';
const GREY = { fill: '#c9d3da', line: '#8a9aa5' };
const HAIR = {
  short: { front: 'M-11 -2 C-12 -14 -4 -17 0 -17 C8 -17 12 -12 11 -2 C8 -9 -6 -10 -11 -2 Z' },
  long: { back: 'M-13 -2 C-14 -18 14 -18 13 -2 L15 20 C6 24 -6 24 -15 20 Z',
    front: 'M-12 -1 C-12 -14 -4 -17 0 -17 C8 -17 12 -14 12 -1 C8 -10 -6 -11 -12 -1 Z' },
  none: {},
};
const FACE = `<circle cx="-4.5" cy="1" r="1.5" fill="${COLOUR.ink}"/><circle cx="4.5" cy="1" r="1.5" fill="${COLOUR.ink}"/>
  <path d="M-4 6 Q0 9.5 4 6" fill="none" stroke="#8f2a22" stroke-width="1.3" stroke-linecap="round"/>`;
const PERSON_LINE = 'stroke-width="2.5" stroke-linejoin="round"';

export function person(x, y, { shirt = null, hair = 'short', old = false, scale = 1, face = false } = {}) {
  const body = shirt ? `fill="${COLOUR[shirt]}" stroke="${COLOUR.ink}"` : `fill="${GREY.fill}" stroke="${GREY.line}"`;
  const head = shirt ? `fill="${SKIN}" stroke="${SKIN_LINE}"` : `fill="${GREY.fill}" stroke="${GREY.line}"`;
  const hairColour = !shirt ? GREY.line : old ? '#e4e7ea' : '#3b2f2a';
  const { back, front } = HAIR[hair];
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M-17 44 V30 C-17 20 -10 16 0 16 C10 16 17 20 17 30 V44 Z" ${body} ${PERSON_LINE}/>
    ${back ? `<path d="${back}" fill="${hairColour}"/>` : ''}<circle r="12" ${head} ${PERSON_LINE}/>
    ${front ? `<path d="${front}" fill="${hairColour}"${old ? ` stroke="${GREY.line}" stroke-width="1"` : ''}/>` : ''}
    ${face ? FACE : ''}
  </g>`;
}

export function pointingArm(points, shirt, [fingerX, fingerY]) {
  const path = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x} ${y}`).join(' ');
  const [handX, handY] = points.at(-1);
  const length = Math.hypot(fingerX, fingerY);
  const finger = `M${handX} ${handY} l${(fingerX / length * 9).toFixed(1)} ${(fingerY / length * 9).toFixed(1)}`;
  return `<g stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="${path}" stroke="${COLOUR.ink}" stroke-width="10"/>
    <path d="${path}" stroke="${COLOUR[shirt]}" stroke-width="5.5"/>
    <path d="${finger}" stroke="${SKIN_LINE}" stroke-width="5.5"/><path d="${finger}" stroke="${SKIN}" stroke-width="3"/>
    <circle cx="${handX}" cy="${handY}" r="4.5" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>
  </g>`;
}

export const ring = (x1, y1, x2, y2) =>
  `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="14" fill="${COLOUR.yellow}" fill-opacity="0.2" stroke="#e0a526" stroke-width="3.5"/>`;

export const speechBubble = (tailX, tailY) =>
  `<path d="M6 4 H44 Q50 4 50 10 V24 Q50 30 44 30 H${Math.max(tailX, 16) + 6} L${tailX} ${tailY} L${Math.max(tailX, 16) - 4} 30 H6 Q0 30 0 24 V10 Q0 4 6 4 Z" fill="${COLOUR.white}" stroke="#6f8796" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M10 13 H40 M10 21 H32" stroke="#9fb0bb" stroke-width="3" stroke-linecap="round"/>`;
