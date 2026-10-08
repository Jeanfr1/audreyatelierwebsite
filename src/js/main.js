import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource-variable/inter/wght.css';
import '../css/main.css';

import { initNav } from './nav.js';
import { initHero } from './hero.js';
import { initReveal, initDrift } from './reveal.js';

const onHeroProgress = initNav();
initHero(onHeroProgress);
initReveal();
initDrift();
