export class EmailAddress {
  constructor(value) {
    if (typeof value !== 'string' || !value.includes('@')) {
      throw new Error(`Adresse invalide : ${value}`);
    }
    this.value = value;
  }
}