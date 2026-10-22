export class ConsoleLogger {
  #clock;
  #sink;
  #history = [];

  constructor({ clock = () => new Date(), sink = console.log } = {}) {
    this.#clock = clock;
    this.#sink = sink;
  }

  info(message) {
    const line = `[${this.#clock().toISOString()}] ${message}`;
    this.#sink(line);
    this.#history.push(line);
  }

  get history() {
    return [...this.#history];
  }
}