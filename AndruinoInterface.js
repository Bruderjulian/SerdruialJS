const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { Settings } = require("./boards.js");

class Interface {
  #debugging = {};
  constructor(options, PinData, openCallback) {
    if (
      !options ||
      !PinData ||
      typeof options.path !== "string" ||
      options.path == "" ||
      !Interface.#validBaudRate(options.baudRate)
    )
      throw Error("Invalid Arguments");
    this.readNext = "";
    var {
      debugging: { logWriting, logReading },
      ...opt
    } = options;
    this.#debugging = {
      logWriting: logWriting || false,
      logReading: logReading || false,
      currentParser: "",
    };
    this.PinData = this.parsePinData(PinData);
    if (options.caching == true)
      this.cache = this.PinData.reduce(
        (acc, curr) => ((acc[curr] = 0), acc),
        {}
      );
    this.port = new SerialPort(opt, openCallback);
    this.port.on("error", function (err) {
      console.error(err);
    });
    this.port.on("close", function (err) {
      console.error(err);
    });
    this.initParser(options.parser, this.#debugging.logReading);
  }

  initParser(
    parserId = this.#debugging.currentParser,
    logReading = this.#debugging.logReading
  ) {
    if (!Interface.#validParser(parserId)) return;
    this.#debugging.currentParser = parserId;
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    this.parser.on(
      "data",
      function (log, data) {
        this.readNext = data;
        if (log === true) console.log("Reading:", data);
      }.bind(this, logReading)
    );
  }

  sendCommand(id, arg1, arg2, arg3) {
    if (typeof id !== "string") return;
    this.port.write(this.#createData(id, arg1, arg2, arg3));
  }
  pinMode(pin, mode = false) {
    if (!this.#validPin(pin) || typeof mode !== "boolean") return;
    this.port.write(this.#createData("setPinMode", pin.substring(1), +mode));
  }

  readPin(pin) {
    if (!this.#validPin(pin)) return;
    this.port.write(this.#createData("readDigitalPin", pin.substring(1)));
  }

  setPin(pin, value = 0) {
    value = Interface.formatValue(value, pin.includes("A"));
    if (!this.#validPin(pin) || typeof value !== "number") return;
    if (this.cache && this.cache[pin] == value) return;
    this.port.write(this.#createData("setDigitalPin", pin.substring(1), value));
    if (this.cache)this.cache[pin] = value
  }

  read() {
    return this.readNext || "";
  }

  close() {
    this.port.close();
  }

  open(openCallback) {
    this.port.open(openCallback);
  }

  isAvailiable() {
    return this.port.isOpen || false;
  }

  static getAvailiablePorts() {
    return SerialPort.list();
  }

  parsePinData(data) {
    if (typeof data !== "string") return;
    var pins = [];
    var tokens = data.split("/");
    for (let i = 0; i < tokens.length; i++) {
      const idx = tokens[i].indexOf("-");
      if (idx === -1) {
        pins.push(tokens[i]);
        continue;
      }
      const prefix = tokens[i].slice(0, 1);
      const start = parseInt(tokens[i].slice(1, idx), 10);
      const end = parseInt(tokens[i].slice(idx + 2), 10);
      if (isNaN(start) || isNaN(end) || end < start) {
        console.error("Invalid Pin Data");
        continue;
      }
      for (let i = start; i <= end; i++) {
        pins.push(`${prefix}${i}`);
      }
    }
    return pins;
  }

  #createData() {
    var out = Settings.InputIdentifier;
    var len = Math.min(arguments.length, Settings.maxArguments);
    for (let i = 0; i < len; i++) {
      let endChar = i == len - 1 ? "\n" : " ";
      if (arguments[i] != undefined) out += arguments[i] + endChar;
    }
    if (this.#debugging.logWriting) console.log("Writing:", out.replace("\n", ""));
    return out;
  }

  static #validBaudRate(rate) {
    return Settings.baudRates.hasOwnProperty("$" + rate);
  }

  #validPin(pin) {
    return this.PinData.includes(pin);
  }

  debugMode(options) {
    if (!options) return;
    for (const i of Object.keys(options)) {
      if (typeof this.#debugging[i] === typeof options[i])
        this.#debugging[i] = options[i];
    }
  }

  static #validParser(id) {
    return Object.values(Settings.Parser).includes(id);
  }

  static formatValue(value, isAnalog = false) {
    if (isAnalog) {
      return Math.max(
        Math.min(Math.abs(Math.round(parseInt(value), 10)), 255),
        0
      );
    } else return +value;
  }
}

module.exports = { AndruinoInterface: Interface };
