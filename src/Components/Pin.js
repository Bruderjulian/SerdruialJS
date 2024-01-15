const { isObject, validatePin } = require("../utils");
const Component = require("./Component");

class Pin extends Component {
  #interval = false;
  #_this;
  static ComponentData = {
    name: "Pin",
  };
  constructor(options) {
    super(isObject(options) ? options.Base : undefined);
    this.#interval = undefined;
    var { pin, type, mode } = validatePin(options);
    this.pin = pin;
    this.type = type;
    this.mode = mode;
  }

  init() {
    this.#_this.pinMode(this.pin, this.mode == "output" ? false : true);
  }

  high(value = true) {
    this.#_this.setPin(this.pin, value);
  }

  low() {
    this.#_this.setPin(this.pin, false);
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = undefined;
    }
  }

  write(value) {
    this.#_this.setPin(this.pin, value);
  }

  read() {
    this.#_this.readPin(this.pin);
  }

  pulse() {}

  toggle() {
    this.#_this.setPin(this.pin, this.getState() > 0 ? 0 : 255);
  }

  getState() {
    return this.#_this.readCache(this.pin);
  }

  strobe(duration) {
    this.#interval = setInterval(
      function () {
        this.toggle();
      }.bind(this),
      duration
    );
  }

  get getComponentData() {
    return Pin.ComponentData;
  }
}

module.exports = Pin;
