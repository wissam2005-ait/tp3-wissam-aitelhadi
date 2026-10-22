export class CsvFormatter {
  format(stats) {
    let output = 'categorie;montant_ht\n';
    for (const c of Object.keys(stats.byCategory).sort()) {
      output += `${c};${stats.byCategory[c]}\n`;
    }
    output += `TOTAL HT;${stats.revenueHT}\nTVA;${stats.vat}\nTOTAL TTC;${stats.revenueTTC}\n`;
    return output;
  }
}