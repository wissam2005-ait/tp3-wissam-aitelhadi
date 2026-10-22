import { buildReportService } from './main.js';
const { service, mailer } = buildReportService();
console.log(service.generate('2026-09', 'csv'));
console.log(service.generate('2026-09', 'html', 'direction@shoplite.fr'));
console.log('E-mails envoyés :', mailer.outbox.length);