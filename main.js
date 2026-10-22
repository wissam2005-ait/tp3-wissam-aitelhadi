import { ReportService } from './application/ReportService.js';
import { FormatterRegistry } from './formatters/FormatterRegistry.js';
import { CsvFormatter } from './formatters/CsvFormatter.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { JsonFileOrderRepository } from './infrastructure/JsonFileOrderRepository.js';
import { SmtpMailer } from './infrastructure/SmtpMailer.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';
import { proPolicy, freePolicy } from './policies/AccountPolicy.js';

export function buildFormatters() {
  return new FormatterRegistry()
    .register('csv', new CsvFormatter())
    .register('html', new HtmlFormatter())
    .register('json', new JsonFormatter());
}

export function buildReportService({
  env = process.env,
  plan = 'pro',
  ordersFile = new URL('./orders.json', import.meta.url),
  orders = new JsonFileOrderRepository(ordersFile),
  formatters = buildFormatters(),
  mailer = new SmtpMailer({
    host: env.SMTP_HOST ?? 'smtp.shoplite.fr',
    port: Number(env.SMTP_PORT ?? 587),
    user: env.SMTP_USER ?? 'reports',
    password: env.SMTP_PASSWORD, // jamais dans le code : variable d'environnement
  }),
  logger = new ConsoleLogger(),
  policy = plan === 'free' ? freePolicy() : proPolicy(),
} = {}) {
  const service = new ReportService({ orders, formatters, mailer, logger, policy });
  return { service, mailer, logger, formatters, policy };
}