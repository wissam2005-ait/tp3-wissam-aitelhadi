import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReportService } from './main.js';
import { ReportService } from './application/ReportService.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';

// Journal silencieux : on évite le bruit dans la console pendant les tests
const build = (opts = {}) => buildReportService({ logger: new ConsoleLogger({ sink: () => {} }), ...opts });

const CSV_SEPT = 'categorie;montant_ht\ninformatique;416\nlivres;135\n' +
  'TOTAL HT;551\nTVA;110.2\nTOTAL TTC;661.2\n';

test('CSV de septembre 2026 (commande annulée exclue)', () => {
  assert.equal(build().service.generate('2026-09', 'csv'), CSV_SEPT);
});

test('HTML de septembre 2026', () => {
  assert.equal(build().service.generate('2026-09', 'html'),
    '<h1>Ventes 2026-09</h1><p>3 commande(s), panier moyen 183.67 €</p><ul>' +
    '<li>informatique : 416 €</li><li>livres : 135 €</li></ul><p><b>Total TTC : 661.2 €</b></p>');
});

test('JSON de septembre 2026', () => {
  assert.deepEqual(JSON.parse(build().service.generate('2026-09', 'json')), {
    month: '2026-09', count: 3, revenueHT: 551, vat: 110.2, revenueTTC: 661.2,
    average: 183.67, byCategory: { informatique: 416, livres: 135 },
  });
});

test('mois sans commande : totaux à zéro', () => {
  assert.equal(build().service.generate('2026-01', 'csv'),
    'categorie;montant_ht\nTOTAL HT;0\nTVA;0\nTOTAL TTC;0\n');
});

test('format inconnu refusé', () => {
  assert.throws(() => build().service.generate('2026-09', 'pdf'), /Format non supporté/);
});

test('envoi par e-mail : un message dans la boîte d’envoi', () => {
  const { service, mailer } = build();
  service.generate('2026-09', 'csv', 'direction@shoplite.fr');
  assert.equal(mailer.outbox.length, 1);
  assert.equal(mailer.outbox[0].to, 'direction@shoplite.fr');
  assert.equal(mailer.outbox[0].body, CSV_SEPT);
});

test('adresse e-mail invalide refusée', () => {
  assert.throws(() => build().service.generate('2026-09', 'csv', 'direction'), /Adresse invalide/);
});

test('CSV d’octobre 2026 (une seule commande)', () => {
  assert.equal(build().service.generate('2026-10', 'csv'),
    'categorie;montant_ht\ninformatique;57\nTOTAL HT;57\nTVA;11.4\nTOTAL TTC;68.4\n');
});

test('injection : des faux remplacent lecture, envoi, journal et politique', () => {
  const sent = [], logs = [];
  const s = new ReportService({
    orders: { all: () => [{ date: '2026-09-01', status: 'PAID', lines: [{ category: 'x', qty: 1, unitPrice: 10 }] }] },
    formatters: { get: () => ({ format: st => `HT=${st.revenueHT}` }) },
    mailer: { send: m => sent.push(m) },
    logger: { info: m => logs.push(m) },
    policy: { check: () => {} },
  });
  assert.equal(s.generate('2026-09', 'peu-importe', 'a@b.fr'), 'HT=10');
  assert.equal(sent.length, 1);
  assert.equal(logs.length, 1);
});

test('offre gratuite : même classe, politique injectée', () => {
  const { service } = build({ plan: 'free' });
  assert.equal(service.generate('2026-09', 'csv').startsWith('categorie;montant_ht'), true);
  assert.throws(() => service.generate('2026-09', 'html'), /Format réservé aux comptes Pro/);
  assert.throws(() => service.generate('2026-09', 'csv', 'a@b.fr'), /Envoi par e-mail réservé aux comptes Pro/);
});

test('un format Markdown s’ajoute sans modifier ReportService', () => {
  const { service, formatters } = build();
  formatters.register('md', { format: s => `# Ventes ${s.month}\n` });
  assert.equal(service.generate('2026-09', 'md'), '# Ventes 2026-09\n');
});