import { full } from '../data/timeline.js';

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = nav?.querySelector('[data-menu-toggle]');
  const menu = nav?.querySelector('[data-menu]');
  const label = nav?.querySelector('[data-menu-label]');
  const hero = document.querySelector('[data-hero]');
  if (!nav) return;

  // Mobile menu
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    menu.hidden = !open;
    nav.classList.toggle('is-open', open);
    syncTone();
  };
  toggle?.addEventListener('click', () => setOpen(menu.hidden));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
  });
  addEventListener('resize', () => { if (innerWidth > 900 && !menu.hidden) setOpen(false); });

  // Tone: dark glass over the photo, ivory pill over light sections and the hero panels
  let heroP = 0; let heroMode = 'static';
  function syncTone() {
    const navBottom = nav.firstElementChild.getBoundingClientRect().bottom;
    const pastHero = hero.getBoundingClientRect().bottom <= navBottom;
    const panels = heroMode === 'full' && heroP > full.panels.clip[0] + 0.02;
    nav.classList.toggle('is-light', pastHero || panels || nav.classList.contains('is-open'));
  }
  addEventListener('scroll', syncTone, { passive: true });
  syncTone();

  return (p, mode) => { heroP = p; heroMode = mode; syncTone(); };
}
