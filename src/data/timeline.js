// Hero timeline — transcribed from atelier-audrey-editorial/05-roteiros/02-animacao.md
// Progress 0→1 across the pinned track. Values are fractions of that track.
export const FACE = { x: 63.4, y: 34 }; // portrait face centre, % of the source photo

export const full = {
  track: '240svh',
  macro: { scale: [1.12, 1.04], until: 0.18 },            // 0–0.18 macro covers the stage
  cue: [0.03, 0.13],                                       // location + scroll cue fade out
  reveal: [0.18, 0.42],                                    // portrait crossfade + soft mask from the face + blur 8→0
  blur: 8,
  copy: [[0.3, 0.4], [0.33, 0.42], [0.36, 0.45]],          // title, tagline, tags+CTA (staggered)
  meche: { range: [0.42, 0.65], x: [12, -10], rot: [-4, 2], peak: 0.95 },
  panels: {
    copyOut: [0.65, 0.73],
    clip: [0.66, 0.82],                                     // portrait narrows to 58% width (clip only, no face transform)
    inset: { top: 13, right: 2.6, bottom: 6, left: 42 },    // % of the stage at the end of the clip
    title: [0.72, 0.8],
    open: { start: 0.72, dur: 0.1, stagger: 0.03 },          // vertical masks: Coupe, Couleur, Texture
  },
  // 0.88–1: hold, then the sticky stage releases into Signature (same ivory ground)
};

export const compact = {
  track: '150svh',                                          // brief: 150svh max on mobile
  macro: { scale: [1.08, 1.03], until: 0.3 },
  cue: [0.04, 0.2],
  reveal: [0.24, 0.66],
  blur: 0,                                                  // no animated blur on mobile
  copy: [[0.46, 0.66], [0.52, 0.72], [0.58, 0.78]],
  meche: { range: [0.5, 0.98], x: [2, -2], rot: [-1, 1], peak: 0.7 }, // movement limited to 4%
  panels: null,                                             // panels become the cards in normal flow
};
