import fs from 'node:fs';

export class JsonFileOrderRepository {
  #file;

  constructor(file) {
    this.#file = file;
  }

  all() {
    return JSON.parse(fs.readFileSync(this.#file, 'utf8'));
  }
}