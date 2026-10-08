// Section continuity (02-animacao.md · Continuidade). Owns every hidden
// state: .reveal-on is added here, right before observing (scroll rule 1).
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

export function initReveal() {
  const root = document.documentElement;
  if (reduce.matches || !('IntersectionObserver' in window)) return;

  // Expertises: vertical clip reveals, 600 ms, stagger capped at 90 ms
  document.querySelectorAll('[data-card]').forEach((card, i) => {
    card.style.setProperty('--d', `${Math.min(i, 3) * 30}ms`);
  });

  root.classList.add('reveal-on');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  document.querySelectorAll('[data-reveal], [data-card], [data-reveal-media], [data-fade], [data-line]').forEach((el) => io.observe(el));

  // Safety net: anything still hidden after a hash jump or a fast scroll gets revealed
  addEventListener('hashchange', () => setTimeout(revealAbove, 600));
  function revealAbove() {
    document.querySelectorAll('[data-reveal], [data-card], [data-reveal-media], [data-fade], [data-line]').forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in');
    });
  }
}

// Discreet scroll-linked drifts: the hair curve links the sections.
// nuances macro ≤ 4% lateral, signature strand, the big "nuances" word.
export function initDrift() {
  if (reduce.matches) return;
  const items = [...document.querySelectorAll('[data-drift]')].map((el) => ({
    el,
    kind: el.dataset.drift,
    target: el.dataset.drift === 'macro' ? el.querySelector('img') : el.querySelector('img') || el,
  }));
  if (!items.length) return;

  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = innerHeight;
    for (const { el, kind, target } of items) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const t = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))); // 0 entering → 1 leaving
      const k = t * 2 - 1; // -1 → 1
      if (kind === 'macro') target.style.transform = `translateX(${(-k * 3.6).toFixed(2)}%)`;
      else if (kind === 'meche') target.style.transform = `translateX(${(-k * 2.5).toFixed(2)}%) rotate(${(k * 2).toFixed(2)}deg)`;
      else if (kind === 'word') target.style.transform = `translateX(${(-k * 2).toFixed(2)}%)`;
    }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}
