/*
 * Drawings of the dictionary's words (words/words.js), in a section per
 * teaching unit. Each is a function, so its helpers stay its own.
 * `node tools/draw.mjs` writes them to words/img/<id>.svg; never edit those.
 * Shared parts are in tools/svg.mjs.
 */
import { svg, OUTLINE, COLOUR, shadow, glass, clockFace, sky } from '../tools/svg.mjs';

const { ink, white, cream, red, orange, yellow, green, teal, blue, purple, pink, brown, tan } = COLOUR;

// Unit 1 · Sounds & Spelling

const casa = () => svg('a house', `${shadow(64, 114, 46)}
  <rect x="26" y="56" width="76" height="56" fill="${cream}" ${OUTLINE}/>
  <path d="M16 60 L64 20 L112 60 Z" fill="${red}" ${OUTLINE}/>
  <rect x="54" y="76" width="20" height="36" fill="${brown}" ${OUTLINE}/>
  <rect x="34" y="68" width="14" height="14" fill="${blue}" ${OUTLINE}/>
  <rect x="80" y="68" width="14" height="14" fill="${blue}" ${OUTLINE}/>`);

const mesa = () => svg('a table', `${shadow(64, 112, 48)}
  <rect x="22" y="54" width="10" height="56" fill="${brown}" ${OUTLINE}/>
  <rect x="96" y="54" width="10" height="56" fill="${brown}" ${OUTLINE}/>
  <rect x="12" y="44" width="104" height="14" rx="3" fill="${tan}" ${OUTLINE}/>`);

const libro = () => svg('a book', `${shadow(64, 112, 42)}
  <path d="M28 26 L96 18 L100 98 L32 106 Z" fill="${white}" ${OUTLINE}/>
  <path d="M24 30 L92 22 L96 102 L28 110 Z" fill="${blue}" ${OUTLINE}/>
  <path d="M40 44 L80 39" stroke="${white}" stroke-width="4" stroke-linecap="round"/>
  <path d="M41 56 L72 52" stroke="${white}" stroke-width="4" stroke-linecap="round"/>`);

function sol() {
  const rays = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * 2 * Math.PI;
    const point = radius => [64 + radius * Math.cos(angle), 64 + radius * Math.sin(angle)].map(Math.round).join(' ');
    return `<path d="M${point(36)} L${point(54)}" stroke="${orange}" stroke-width="6" stroke-linecap="round"/>`;
  }).join('');
  return svg('the sun', `${rays}<circle cx="64" cy="64" r="28" fill="${yellow}" ${OUTLINE}/>`);
}

const luna = () => svg('the moon', `
  <path d="M78 18 A48 48 0 1 0 110 86 A38 38 0 1 1 78 18 Z" fill="${cream}" ${OUTLINE}/>
  <circle cx="52" cy="70" r="6" fill="${tan}" opacity=".5"/>
  <circle cx="66" cy="96" r="4" fill="${tan}" opacity=".5"/>`);

const huevo = () => svg('an egg', `${shadow(64, 114, 30)}
  <path d="M64 16 C88 16 100 56 100 78 C100 100 84 112 64 112 C44 112 28 100 28 78 C28 56 40 16 64 16 Z" fill="${cream}" ${OUTLINE}/>
  <path d="M46 52 C48 42 52 34 56 30" stroke="${white}" stroke-width="5" stroke-linecap="round"/>`);

const jugo = () => svg('a glass of orange juice', `${glass(orange)}
  <path d="M70 6 L62 70" stroke="${pink}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="92" cy="22" r="14" fill="${orange}" ${OUTLINE}/>
  <path d="M92 10 L92 34 M80 22 L104 22" stroke="${yellow}" stroke-width="2"/>`);

const gato = () => svg('a cat', `
  <path d="M28 54 L30 18 L54 40 Z" fill="${orange}" ${OUTLINE}/>
  <path d="M100 54 L98 18 L74 40 Z" fill="${orange}" ${OUTLINE}/>
  <ellipse cx="64" cy="70" rx="42" ry="38" fill="${orange}" ${OUTLINE}/>
  <ellipse cx="48" cy="64" rx="5" ry="8" fill="${ink}"/>
  <ellipse cx="80" cy="64" rx="5" ry="8" fill="${ink}"/>
  <path d="M60 80 L68 80 L64 85 Z" fill="${pink}" ${OUTLINE}/>
  <path d="M64 86 C62 92 56 92 54 89 M64 86 C66 92 72 92 74 89" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M20 76 L46 80 M20 88 L46 86 M108 76 L82 80 M108 88 L82 86" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`);

const guitarra = () => svg('a guitar', `
  <g transform="rotate(35 64 64)">
    <rect x="59" y="4" width="10" height="56" fill="${brown}" ${OUTLINE}/>
    <rect x="54" y="0" width="20" height="12" rx="3" fill="${ink}"/>
    <path d="M64 50 C84 50 86 64 80 72 C94 78 94 112 64 112 C34 112 34 78 48 72 C42 64 44 50 64 50 Z" fill="${orange}" ${OUTLINE}/>
    <circle cx="64" cy="80" r="9" fill="${ink}"/>
    <rect x="54" y="96" width="20" height="5" fill="${ink}"/>
    <path d="M62 10 L62 98 M66 10 L66 98" stroke="${cream}" stroke-width="1"/>
  </g>`);

const queso = () => svg('a wedge of cheese', `${shadow(64, 108, 46)}
  <path d="M14 76 L110 50 L114 98 L18 104 Z" fill="${yellow}" ${OUTLINE}/>
  <path d="M14 76 L84 30 L110 50 Z" fill="#ffee80" ${OUTLINE}/>
  <circle cx="40" cy="88" r="7" fill="#e6b800"/>
  <circle cx="72" cy="78" r="5" fill="#e6b800"/>
  <circle cx="94" cy="90" r="6" fill="#e6b800"/>
  <circle cx="72" cy="50" r="4" fill="#e6b800"/>`);

const llave = () => svg('a key', `
  <g transform="rotate(-35 64 64)">
    <circle cx="34" cy="64" r="22" fill="${yellow}" ${OUTLINE}/>
    <circle cx="34" cy="64" r="9" fill="${white}" ${OUTLINE}/>
    <path d="M56 58 L114 58 L114 70 L104 70 L104 82 L94 82 L94 70 L86 70 L86 78 L76 78 L76 70 L56 70 Z" fill="${yellow}" ${OUTLINE}/>
  </g>`);

const pinya = () => svg('a pineapple', `${shadow(64, 118, 28)}
  <path d="M64 44 L52 8 L62 22 L64 2 L68 22 L78 8 Z" fill="${green}" ${OUTLINE}/>
  <path d="M64 44 L40 20 L58 36 M64 44 L88 20 L70 36" fill="none" stroke="${green}" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="64" cy="80" rx="30" ry="38" fill="${yellow}" ${OUTLINE}/>
  <path d="M44 56 L84 104 M38 74 L72 116 M56 46 L92 90 M84 56 L44 104 M90 74 L56 116 M72 46 L36 90" stroke="#c79100" stroke-width="2.5"/>`);

const perro = () => svg('a dog', `
  <ellipse cx="64" cy="66" rx="36" ry="38" fill="${tan}" ${OUTLINE}/>
  <path d="M30 40 C14 44 12 78 22 86 C30 80 32 60 34 48 Z" fill="${brown}" ${OUTLINE}/>
  <path d="M98 40 C114 44 116 78 106 86 C98 80 96 60 94 48 Z" fill="${brown}" ${OUTLINE}/>
  <ellipse cx="64" cy="86" rx="20" ry="15" fill="${cream}" ${OUTLINE}/>
  <ellipse cx="64" cy="78" rx="8" ry="6" fill="${ink}"/>
  <circle cx="50" cy="58" r="5" fill="${ink}"/>
  <circle cx="78" cy="58" r="5" fill="${ink}"/>
  <path d="M64 84 L64 92 M56 94 C60 98 68 98 72 94" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M62 100 C62 110 68 110 68 100" fill="${pink}" ${OUTLINE}/>`);

const zapato = () => svg('a shoe', `${shadow(64, 108, 52)}
  <path d="M14 98 L14 66 C14 56 24 52 34 54 L50 58 C62 60 70 66 80 72 L106 82 C116 86 118 96 114 102 L14 102 Z" fill="${red}" ${OUTLINE}/>
  <path d="M12 98 L116 98 L116 104 C116 106 114 108 112 108 L16 108 C14 108 12 106 12 104 Z" fill="${white}" ${OUTLINE}/>
  <path d="M46 64 L54 72 M56 66 L64 74 M66 70 L72 78" stroke="${white}" stroke-width="3" stroke-linecap="round"/>`);

const vaso = () => svg('a glass of water', glass('#b3e5fc'));

const barco = () => svg('a boat', `
  <path d="M8 104 C22 96 34 112 48 104 C62 96 74 112 88 104 C102 96 112 108 120 104 L120 124 L8 124 Z" fill="${teal}" opacity=".6"/>
  <path d="M62 14 L62 82" stroke="${brown}" stroke-width="4" stroke-linecap="round"/>
  <path d="M66 18 L104 78 L66 78 Z" fill="${white}" ${OUTLINE}/>
  <path d="M58 30 L30 78 L58 78 Z" fill="${yellow}" ${OUTLINE}/>
  <path d="M16 84 L112 84 L98 104 L30 104 Z" fill="${red}" ${OUTLINE}/>`);

// Unit 2 · Greetings · Saludos: each picture shows when the phrase is said.

// A time of day: the sky, what is in it, and a small clock in the corner.
const timeOfDay = (title, skyColour, groundColour, inTheSky, hour) =>
  svg(title, `${sky(skyColour, groundColour, inTheSky)}${clockFace(hour, 0, { cx: 98, cy: 30, r: 15 })}`);

const sunRays = (cx, cy, inner, outer) => Array.from({ length: 10 }, (_, index) => {
  const angle = (index / 10) * 2 * Math.PI;
  const point = radius => `${Math.round(cx + radius * Math.cos(angle))} ${Math.round(cy + radius * Math.sin(angle))}`;
  return `<path d="M${point(inner)} L${point(outer)}" stroke="${orange}" stroke-width="5" stroke-linecap="round"/>`;
}).join('');

const buenosDias = () => timeOfDay('the sun rising: morning', '#cfe9ff', green,
  `${sunRays(40, 96, 26, 38)}<circle cx="40" cy="96" r="22" fill="${yellow}" ${OUTLINE}/>`, 8);

const buenasTardes = () => timeOfDay('the sun high in the sky: afternoon', '#7cc4f5', green,
  `${sunRays(48, 52, 24, 34)}<circle cx="48" cy="52" r="18" fill="${yellow}" ${OUTLINE}/>`, 3);

const buenasNoches = () => timeOfDay('the moon and stars: night', '#1a2a5a', '#2e4a2e',
  `<path d="M52 30 A26 26 0 1 0 72 72 A20 20 0 1 1 52 30 Z" fill="${cream}" ${OUTLINE}/>
   <path d="M24 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z M80 64 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z M104 82 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z" fill="${yellow}"/>`, 9);

const adios = () => svg('a hand waving goodbye', `
  <path d="M20 36 C14 32 14 24 20 22 M14 50 C6 46 6 36 12 32 M108 36 C114 32 114 24 108 22 M114 50 C122 46 122 36 116 32" fill="none" stroke="${teal}" stroke-width="4" stroke-linecap="round"/>
  <g transform="rotate(-12 64 70)">
    <path d="M42 120 L42 66 C42 60 50 60 50 66 L50 30 C50 22 60 22 60 30 L60 60 L60 22 C60 14 70 14 70 22 L70 60 L70 28 C70 20 80 20 80 28 L80 64 L80 40 C80 32 90 32 90 40 L90 84 C90 104 80 114 74 120 Z" fill="${tan}" ${OUTLINE}/>
    <path d="M42 80 C34 70 26 60 22 64 C18 68 30 86 42 100" fill="${tan}" ${OUTLINE}/>
  </g>`);

const gracias = () => svg('a present', `${shadow(64, 116, 44)}
  <rect x="22" y="56" width="84" height="56" fill="${purple}" ${OUTLINE}/>
  <rect x="16" y="40" width="96" height="20" fill="${purple}" ${OUTLINE}/>
  <rect x="58" y="40" width="12" height="72" fill="${yellow}" ${OUTLINE}/>
  <path d="M64 40 C50 18 30 24 40 36 C44 40 56 40 64 40 C72 40 84 40 88 36 C98 24 78 18 64 40 Z" fill="${yellow}" ${OUTLINE}/>`);

export default {
  casa: casa(), mesa: mesa(), libro: libro(), sol: sol(), luna: luna(),
  huevo: huevo(), jugo: jugo(), gato: gato(), guitarra: guitarra(), queso: queso(),
  llave: llave(), pinya: pinya(), perro: perro(), zapato: zapato(), vaso: vaso(), barco: barco(),
  'buenos-dias': buenosDias(), 'buenas-tardes': buenasTardes(), 'buenas-noches': buenasNoches(), adios: adios(), gracias: gracias(),
};
