export class HtmlFormatter {
  format(stats) {
    let output = `<h1>Ventes ${stats.month}</h1><p>${stats.count} commande(s), panier moyen ${stats.average} €</p><ul>`;
    for (const c of Object.keys(stats.byCategory).sort()) {
      output += `<li>${c} : ${stats.byCategory[c]} €</li>`;
    }
    output += `</ul><p><b>Total TTC : ${stats.revenueTTC} €</b></p>`;
    return output;
  }
}