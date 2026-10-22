# TP 3 · Refactoring d'une « God class » (SOLID et injection de dépendances)


Refactoring du rapport mensuel des ventes de **ShopLite** : une classe `ReportService` qui lisait les commandes, calculait les ventes, mettait en forme (CSV, HTML, JSON), journalisait et envoyait des e-mails a été découpée en classes à responsabilité unique, sans changer son comportement.

**Auteurs :** wissam aitelhadi

## Lancer le projet

Prérequis : Node.js 20 ou plus.

```bash
node --test ReportService.caracterisation.test.js   # tests de caractérisation
node demo.js                                        # démonstration (CSV, HTML, 1 e-mail)
```

Sous Windows, si `*.test.js` n'est pas reconnu, donner les fichiers de test un par un.

## Structure

```
domain/            salesStats.js (calcul pur) · EmailAddress.js (règle de validité)
formatters/        CsvFormatter · HtmlFormatter · JsonFormatter · FormatterRegistry
infrastructure/    JsonFileOrderRepository · SmtpMailer · ConsoleLogger
policies/          AccountPolicy (offre gratuite / pro)
application/       ReportService (orchestre, ne crée aucune dépendance)
main.js            composition root : le seul fichier avec des `new`
demo.js            démonstration en ligne de commande
orders.json        5 commandes de test
VIOLATIONS.md      diagnostic : tableau des violations SOLID du code de départ
REVUE.md           revue croisée par un autre binôme
```

## Démarche

1. **Diagnostic** du code de départ : voir `VIOLATIONS.md`.
2. **Filet de sécurité** : tests de caractérisation qui figent le comportement actuel, plus un 8e test sur le CSV d'octobre 2026.
3. **Refactoring par petites extractions**, tests verts après chacune :
   1. le calcul devient une fonction pure `computeStats(orders, month)` ;
   2. un formateur par format, rangés dans un `FormatterRegistry` ;
   3. lecture, envoi et journal reçus par le constructeur ;
   4. l'offre gratuite devient une politique injectée (plus de sous-classe) ;
   5. composition root dans `main.js`, configuration SMTP lue dans l'environnement.

## Principes SOLID appliqués

| Principe | Comment |
|----------|---------|
| **S** Responsabilité unique | Un fichier par responsabilité : calcul, formats, stockage, envoi, journal. |
| **O** Ouvert / fermé | Un nouveau format s'ajoute avec `formatters.register('md', …)`, sans modifier `ReportService` (test dédié). |
| **L** Substitution de Liskov | `FreeReportService` est supprimée : la même classe est configurée avec `freePolicy()`, interrogeable par l'appelant (`allowsFormat`, `canEmail`). |
| **I** Ségrégation des interfaces | `ReportService` ne dépend que de petits contrats : `all()`, `format()`, `send()`, `info()`, `check()`. |
| **D** Inversion des dépendances | Aucun `fs`, `console` ni `new` d'infrastructure dans `domain/` ni `application/`. Tout est injecté depuis `main.js`. |

## Configuration (SMTP)

Aucun secret dans le code. Les paramètres viennent de variables d'environnement (voir `.env.example`) :

```
SMTP_HOST=smtp.shoplite.fr
SMTP_PORT=587
SMTP_USER=reports
SMTP_PASSWORD=
```


## Ajouter un format

```js
import { buildReportService } from './main.js';

const { service, formatters } = buildReportService();
formatters.register('md', { format: s => `# Ventes ${s.month}\n` });
console.log(service.generate('2026-09', 'md'));
```
