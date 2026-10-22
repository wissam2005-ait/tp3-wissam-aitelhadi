export class JsonFormatter {
  format(stats) {
    const { month, count, revenueHT, vat, revenueTTC, average, byCategory } = stats;
    return JSON.stringify({ month, count, revenueHT, vat, revenueTTC, average, byCategory });
  }
}