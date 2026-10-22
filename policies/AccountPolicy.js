export class AccountPolicy {
  #formats; // null = tous les formats
  #canEmail;

  constructor({ formats = null, canEmail = true } = {}) {
    this.#formats = formats;
    this.#canEmail = canEmail;
  }

  allowsFormat(format) {
    return this.#formats === null || this.#formats.includes(format);
  }

  get canEmail() {
    return this.#canEmail;
  }

  check({ format, recipient }) {
    if (!this.allowsFormat(format)) throw new Error('Format réservé aux comptes Pro');
    if (recipient && !this.#canEmail) throw new Error('Envoi par e-mail réservé aux comptes Pro');
  }
}

export const proPolicy = () => new AccountPolicy();
export const freePolicy = () => new AccountPolicy({ formats: ['csv'], canEmail: false });