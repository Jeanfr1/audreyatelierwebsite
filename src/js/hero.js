import { full, compact, FACE } from '../data/timeline.js';

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (p, [a, b]) => clamp01((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

const root = document.documentElement;
const params = new URLSearchParams(location.search);
const NO_SMOOTH = params.has('nosmooth');
const FORCE = params.get('p'); // ?p=0.5 freezes the scroll timeline (captures)
const FORCE_INTRO = params.get('i'); // ?i=0.4 freezes the opening (captures)

export function initHero(onProgress) {
  const hero = document.querySelector('[data-hero]');
  const stage = hero?.querySelector('[data-stage]');
  if (!stage) return;

  const q = (name) => stage.querySelector(`[data-layer="${name}"]`);
  const L = {
    macro: q('macro'), macroImg: q('macro').querySelector('img'),
    portrait: q('portrait'), scrim: q('scrim'), meche: q('meche'),
    panels: q('panels'), aside: q('aside'), cue: q('cue'),
  };
  const copy = [0, 1, 2].map((i) => [...stage.querySelectorAll(`[data-copy="${i}"]`)]);
  const panelImgs = [...stage.querySelectorAll('[data-panel] img')];
  const panelCaps = [...stage.querySelectorAll('[data-panel] figcaption')];
  const panelsTitle = stage.querySelector('[data-panels-title]');
  const touched = new Set();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let mode = null; let T = null;
  let target = 0; let current = 0; let raf = 0;
  let intro = 1; let playing = false; let rate = 1; let last = 0; let portraitReady = true;

  const set = (el, prop, value) => { if (!el) return; el.style[prop] = value; touched.add(el); };

  function pickMode() {
    if (reduce.matches || innerHeight < 480) return 'static';
    return innerWidth >= 1024 && innerHeight >= 600 ? 'full' : 'compact';
  }

  function applyMode() {
    const next = pickMode();
    if (next === mode) return;
    const first = mode === null;
    mode = next;
    root.dataset.heroMode = mode; // tells the boot script in index.html that the hero took over
    touched.forEach((el) => el.removeAttribute('style'));
    touched.clear();
    root.classList.remove('hero-scroll', 'hero-full', 'hero-compact');
    if (mode === 'static') { T = null; intro = 1; playing = false; stage.dataset.progress = 'static'; onProgress?.(1, mode); return; }
    T = mode === 'full' ? full : compact;
    root.style.setProperty('--hero-track', T.track);
    root.classList.add('hero-scroll', `hero-${mode}`);
    current = target = measure();
    if (first) playIntro();
    render(current);
  }

  // Opening: plays once by itself so the page never lands on a still frame.
  // Skipped when the page loads inside the track (restored scroll, hash) and for captures.
  function playIntro() {
    if (FORCE_INTRO !== null) { intro = clamp01(parseFloat(FORCE_INTRO)); return; }
    if (FORCE !== null || target > 0.01) return;
    intro = 0; playing = true; portraitReady = false;
    const img = L.portrait.querySelector('img');
    Promise.race([img.decode?.().catch(() => {}), new Promise((r) => setTimeout(r, 1500))])
      .then(() => { portraitReady = true; });
    kick();
  }

  function measure() {
    if (FORCE !== null) return clamp01(parseFloat(FORCE));
    const r = hero.getBoundingClientRect();
    const dist = hero.offsetHeight - stage.offsetHeight;
    return dist > 0 ? clamp01(-r.top / dist) : 0;
  }

  function render(p) {
    const isFull = mode === 'full';

    // opening (time-driven, see playIntro) · the camera pulls back out of the strands
    const I = T.intro;
    const m = easeOut(seg(intro, I.macro.range));
    set(L.macroImg, 'transform', `scale(${lerp(I.macro.scale[0], I.macro.scale[1], m).toFixed(4)})`);

    const cue = 1 - seg(intro, I.cue);
    set(L.cue, 'opacity', cue.toFixed(3));
    set(L.cue, 'visibility', cue > 0 ? 'visible' : 'hidden');

    // opening · portrait revealed: crossfade + soft mask growing from the face, blur 8 → 0
    const r = seg(intro, I.reveal);
    const rv = easeInOut(r);
    const op = easeOut(clamp01(r * 2.2));
    set(L.portrait, 'opacity', op.toFixed(3));
    if (r > 0 && r < 1) {
      const edge = lerp(4, 120, easeInOut(r));
      const mask = `radial-gradient(circle farthest-corner at ${FACE.x}% ${FACE.y}%, #000 ${Math.max(0, edge - 16).toFixed(2)}%, transparent ${edge.toFixed(2)}%)`;
      set(L.portrait, 'maskImage', mask); set(L.portrait, 'webkitMaskImage', mask);
    } else {
      const mask = r >= 1 ? 'none' : 'linear-gradient(transparent, transparent)';
      set(L.portrait, 'maskImage', mask); set(L.portrait, 'webkitMaskImage', mask);
    }
    const blur = I.blur * (1 - easeOut(r));
    set(L.portrait, 'filter', blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none');
    set(L.macro, 'visibility', op >= 1 && r >= 1 ? 'hidden' : 'visible');

    // panels phase values (full mode only)
    const P = T.panels;
    const out = P ? easeInOut(seg(p, P.copyOut)) : 0;

    set(L.scrim, 'opacity', (rv * (1 - out)).toFixed(3));

    copy.forEach((els, i) => {
      const t = easeOut(seg(intro, I.copy[i]));
      const o = t * (1 - out);
      const y = (1 - t) * 26 - out * 18;
      els.forEach((el) => {
        set(el, 'opacity', o.toFixed(3));
        set(el, 'transform', `translateY(${y.toFixed(1)}px)`);
        set(el, 'visibility', o > 0.01 ? 'visible' : 'hidden');
      });
    });
    const asideT = easeOut(seg(intro, I.copy[2])) * (1 - out);
    set(L.aside, 'opacity', asideT.toFixed(3));
    set(L.aside, 'visibility', asideT > 0.01 ? 'visible' : 'hidden');

    // scroll 0–0.4 · the strand crosses the foreground (2D only, never over the face)
    const M = T.meche;
    const mt = seg(p, M.range);
    const fade = Math.min(clamp01(mt / 0.22), clamp01((1 - mt) / 0.3));
    const mo = mode === 'compact' && mt >= 1 ? 0 : easeSine(fade) * M.peak;
    set(L.meche, 'opacity', mo.toFixed(3));
    set(L.meche, 'visibility', mo > 0.01 ? 'visible' : 'hidden');
    set(L.meche, 'transform', `translateX(${lerp(M.x[0], M.x[1], easeSine(mt)).toFixed(2)}%) rotate(${lerp(M.rot[0], M.rot[1], easeSine(mt)).toFixed(2)}deg)`);

    if (isFull) {
      // scroll 0.4–0.75 · portrait narrows to 58% width, masks open colour, cut and texture
      const c = easeInOut(seg(p, P.clip));
      // ivory ground behind the portrait once it fully covers the stage (switch is invisible)
      set(stage, 'backgroundColor', p >= P.clip[0] ? 'var(--ivory)' : '');
      const { top, right, bottom, left } = P.inset;
      set(L.portrait, 'clipPath', c > 0
        ? `inset(${(top * c).toFixed(3)}% ${(right * c).toFixed(3)}% ${(bottom * c).toFixed(3)}% ${(left * c).toFixed(3)}% round ${(4 * c).toFixed(2)}px)`
        : 'none');
      const tt = easeOut(seg(p, P.title));
      set(panelsTitle, 'opacity', tt.toFixed(3));
      panelImgs.forEach((img, i) => {
        const a = P.open.start + i * P.open.stagger;
        const t = easeInOut(seg(p, [a, a + P.open.dur]));
        set(img, 'clipPath', `inset(${((1 - t) * 100).toFixed(2)}% 0 0 0)`);
        const ct = easeOut(seg(p, [a + P.open.dur * 0.55, a + P.open.dur * 1.1]));
        set(panelCaps[i], 'opacity', ct.toFixed(3));
        set(panelCaps[i], 'transform', `translateY(${((1 - ct) * 10).toFixed(1)}px)`);
      });
      set(L.panels, 'visibility', seg(p, [P.open.start - 0.01, P.open.start]) > 0 ? 'visible' : 'hidden');
    }

    stage.dataset.progress = p.toFixed(3);
    onProgress?.(p, mode);
  }

  function tick(now) {
    raf = 0;
    if (!T) return;
    if (playing) {
      const cap = portraitReady ? 1 : T.intro.reveal[0]; // the macro moves at once; the reveal waits for the decoded portrait
      intro = Math.min(cap, intro + ((now - (last || now)) / T.intro.ms) * rate);
      last = now;
      playing = intro < 1;
    }
    const k = NO_SMOOTH || Math.abs(target - current) > 0.35 ? 1 : 0.16;
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.0004) current = target;
    render(current);
    if (playing || current !== target) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  function onScroll() {
    if (!T) return;
    target = measure();
    if (intro < 1 && target > 0.005) rate = 5; // scrolling during the opening: finish it quickly
    kick();
  }

  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { applyMode(); onScroll(); }, 120);
  }

  applyMode();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize);
  reduce.addEventListener?.('change', () => { applyMode(); onScroll(); });
}
