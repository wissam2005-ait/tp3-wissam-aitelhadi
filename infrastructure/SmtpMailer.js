export class SmtpMailer {
  #config;
  #outbox = [];

  constructor({ host, port, user, password }) {
    this.#config = { host, port, user, password };
  }

  send({ to, subject, body }) {
    this.#outbox.push({
      via: `${this.#config.host}:${this.#config.port}`,
      to,
      subject,
      body,
    });
  }

  get outbox() {
    return this.#outbox.map(m => ({ ...m }));
  }
}