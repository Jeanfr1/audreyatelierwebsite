// Hero timeline — transcribed from atelier-audrey-editorial/05-roteiros/02-animacao.md
// The opening (macro → portrait → title) plays by itself on load, so the page
// never opens on a still; scroll then drives the rest.
// intro: fractions of the intro duration (ms). Scroll: progress 0→1 across the
// pinned track, starting on the revealed portrait.
export const FACE = { x: 63.4, y: 34 }; // portrait face centre, % of the source photo

export const full = {
  track: '190svh',
  intro: {
    ms: 3000,
    macro: { scale: [1.16, 1.04], range: [0, 0.62] },      // camera pulls back out of the strands
    cue: [0.16, 0.36],                                       // location line fades out
    reveal: [0.28, 0.8],                                     // portrait crossfade + soft mask from the face + blur 8→0
    blur: 8,
    copy: [[0.56, 0.84], [0.62, 0.9], [0.68, 0.96]],         // title, tagline, tags+CTA (staggered)
  },
  meche: { range: [0, 0.4], x: [12, -10], rot: [-4, 2], peak: 0.95 },
  panels: {
    copyOut: [0.4, 0.52],
    clip: [0.41, 0.66],                                     // portrait narrows to 58% width (clip only, no face transform)
    inset: { top: 13, right: 2.6, bottom: 6, left: 42 },    // % of the stage at the end of the clip
    title: [0.5, 0.61],
    open: { start: 0.5, dur: 0.155, stagger: 0.045 },        // vertical masks: Coupe, Couleur, Texture
  },
  // 0.75–1: hold, then the sticky stage releases into Signature (same ivory ground)
};

export const compact = {
  track: '140svh',                                          // brief: 150svh max on mobile
  intro: {
    ms: 2600,
    macro: { scale: [1.1, 1.03], range: [0, 0.62] },
    cue: [0.16, 0.36],
    reveal: [0.26, 0.8],
    blur: 0,                                                // no animated blur on mobile
    copy: [[0.54, 0.84], [0.6, 0.9], [0.66, 0.96]],
  },
  meche: { range: [0, 0.92], x: [2, -2], rot: [-1, 1], peak: 0.7 }, // movement limited to 4%
  panels: null,                                             // panels become the cards in normal flow
};
