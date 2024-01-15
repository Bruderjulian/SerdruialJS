const { isObject } = require("../utils");
const Component = require("./Component");

class Led extends Component {
  #interval = false;
  constructor(options) {
    super(isObject(options) ? options.board : undefined);
    if (!this.board.validPin(options.pin)) throw Error("Invalid Pin");
    this.pin = options.pin;
    this.#interval = undefined;
  }

  init() {
    this.board.pinMode(this.pin, false);
  }

  on(value = true) {
    this.board.setPin(this.pin, value);
  }

  off() {
    this.board.setPin(this.pin, false);
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
  }

  toggle() {
    this.board.setPin(this.pin, this.getState() > 0 ? 0 : 255);
  }

  getState() {
    return this.board.readCache(this.pin);
  }

  strobe(duration) {
    this.#interval = setInterval(
      function () {
        this.toggle();
      }.bind(this),
      duration
    );
  }
}

module.exports = Led;
