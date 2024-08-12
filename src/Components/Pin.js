const { isObject, validatePin, formatValue } = require("../utils");
const Component = require("./Component");

class Pin extends Component {
  #interval = false;
  _board;
  static ComponentData = {
    name: "Pin",
  };
  constructor(options) {
    super(isObject(options) ? options.Base : undefined);
    this.#interval = undefined;
    var { pin, type, mode } = validatePin.call(options);
    this.pin = pin;
    this.type = type;
    this.mode = mode;
  }

  init() {
    this._board.pinMode(this.pin, this.mode == "input");
  }

  on() {
    this.high();
  }

  off() {
    this.low();
  }

  high(value = true) {
    this.write(value);
  }

  low() {
    this.write(false);
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
  }

  write(value) {
    this._board.setPin(this.pin, formatValue(value, this.isAnalog()));
  }

  read() {
    this._board.readPin(this.pin);
  }

  pulse() {}

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

  get getComponentData() {
    return Pin.ComponentData;
  }

  isAnalog() {
    return this.type == "analog";
  }
}

module.exports = Pin;
