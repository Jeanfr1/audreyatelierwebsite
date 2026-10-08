// Single source for business facts. Sources (checked 08/10/2026, see
// atelier-audrey-editorial/07-integracao/config.json):
//   address + services: https://www.planity.com/atelier-audrey-44160-pontchateau
//   phone:              https://www.pontchateau.fr/contacts/atelier-audrey/
// The brief forbids prices, opening hours and reviews: none are stored here.
export const site = {
  name: 'Atelier Audrey',
  concept: 'Le mouvement vous révèle',
  url: 'https://atelier-audrey-pontchateau.vercel.app', // TODO(audrey): final domain (canonical, og:url, og:image)
  reservation: 'https://www.planity.com/atelier-audrey-44160-pontchateau',
  phone: { display: '02 51 73 98 92', href: 'tel:+33251739892', e164: '+33251739892' },
  address: {
    street: '31 Rue de la Cadivais',
    postalCode: '44160',
    city: 'Pontchâteau',
    region: 'Loire-Atlantique',
    country: 'FR',
  },
  year: 2026,
};
