const { isObject, validatePin, formatValue } = require("../utils");
const Component = require("./Component");

class Led extends Component {
  #interval = false;
  constructor(options) {
    super(isObject(options) ? options.board : undefined);
    var { pin, type } = validatePin.call(this._board, options);
    this.pin = pin;
    this.type = type;
    this.#interval = undefined;
  }

  init() {
    this._board.pinMode(this.pin, false);
  }

  on() {
    this._board.setPin(this.pin, true);
  }

  off() {
    this.low();
  }

  high() {
    this._board.setPin(this.pin, true);
  }

  low() {
    this._board.setPin(this.pin, false);
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
  }

  toggle() {
    this._board.togglePin(this.pin);
  }

  strobe(rate) {
    this.#interval = setInterval(
      function () {
        this.toggle();
      }.bind(this),
      rate
    );
  }

  write(value) {
    if (typeof value !== "number") return;
    this._board.setPin(this.pin, formatValue(value, isAnalog()));
  }

  read() {
    this._board.readPin(this.pin);
  }

  isAnalog() {
    return this.type == "analog";
  }
}

module.exports = Led;
