const { SerialPort, ReadlineParser, ReadyParser } = require("serialport");
const cmdHandler = require("./CommandHandler.js");
const {    
  parsePinData,
  formatValue,
  validBaudRate,
  isClass,
  isObject,
  validBoard,
  validPort,
} = require("./utils.js");
const PublicConfigs = require("./Configs/PublicConfigs.js");
const InternalConfigs = require("./Configs/InternalConfigs.js");
global.BoardInstances = [];

class ArdruinoInterface {
  #debugging = {};
  #cache = {};
  #port;
  #parser;
  #WriteQueue = [];
  #ReadQueue = [];
  #cmdHandler;
  constructor(options, board, openCallback) {
    if (
      !isObject(options) ||
      !validBoard(board) ||
      !(options.readOrdering == "loose" || options.readOrdering == "strict") ||
      !(typeof options.timeoutMS == "number" || options.timeoutMS == undefined)
    ) {
      throw SyntaxError("Invalid Communication Options");
    }
    if (
      !validPort(options.path) ||
      !validBaudRate(options.baudRate) ||
      !(typeof options.autoOpen == "boolean" || options.autoOpen == undefined)
    ) {
      throw SyntaxError("Invalid Port Options");
    }
    if (
      (typeof options.InputIdentifier !== "string" &&
        options.InputIdentifier !== undefined) ||
      (typeof options.OutputIdentifier !== "string" &&
        options.OutputIdentifier !== undefined)
    ) {
      throw Error("Invalid Identifier Options");
    }
    if (
      (isObject(options.debugging) &&
        typeof options.debugging.logWriting !== "boolean" &&
        options.debugging.logWriting == undefined) ||
      (typeof options.debugging.logReading !== "boolean" &&
        options.debugging.logReading == undefined)
    ) {
      throw SyntaxError("Invalid Debugging Options");
    }
    this.isReady = false;
    this.count = 0;
    this.#WriteQueue = [];
    this.#ReadQueue = [];
    this.readOrdering = options.readOrdering || "loose";
    this.timeoutMS = options.timeoutMS || 3000;
    var portOptions = {
      path: options.path || "",
      baudRate: options.baudRate || 9600,
      autoOpen: options.autoOpen || true,
    };
    if (isObject(options.debugging)) {
      this.#debugging = {
        logWriting: options.debugging.logWriting || false,
        logReading: options.debugging.logReading || false,
      };
    }
    this.#cmdHandler = new cmdHandler(
      InternalConfigs.commands,
      options.InputIdentifier || PublicConfigs.InputIdentifier,
      "\n",
      options.OutputIdentifier || PublicConfigs.OutputIdentifier
    );
    this.board = board;
    this.board.pins = parsePinData(board.pinData);
    if (options.caching == true) {
      this.#cache = this.board.pins.reduce(
        (acc, curr) => ((acc[curr] = 0), acc),
        {}
      );
    }
    global.BoardInstances.push(this);
    this.#initSerialPort(portOptions, openCallback);
  }

  async #initSerialPort(portOptions, openCallback) {
    var boardName = this.board.name;
    if (!portOptions.path) {
      var availiable = await SerialPort.list();
      if (!availiable) throw new Error("Found no availiable Board");
      availiable = availiable.find(function (val) {
        return (
          typeof val.friendlyName == "string" &&
          val.friendlyName.toLowerCase().includes(boardName.toLowerCase())
        );
      });
      if (!availiable) throw new Error("No matching Board found");
      portOptions.path = availiable.path;
    }
    console.log("Connecting to: " + boardName + " (" + portOptions.path + ")");
    this.#port = new SerialPort(portOptions, function () {
      if (typeof openCallback == "function") openCallback();
    });
    this.#port.on("error", function (err) {
      throw Error(err);
    });
    this.#port.on("close", function (err) {
      console.log("Port Closed", err);
    });
    this.#initParser();
  }

  #initParser() {
    if (!this.isReady) {
      this.#parser = this.#port.pipe(new ReadyParser({ delimiter: "#-Ready" }));
      var self = this;
      this.#parser.on("ready", function () {
        console.log("Interface is Ready!");
        self.isReady = true;
        self.#initParser();
        self.#processWriteQueue();
      });
    } else {
      this.#port.unpipe();
      this.#parser = this.#port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
      this.#parser.on(
        "data",
        function (data) {
          data = data.trim();
          if (data != "") this.#processReadQueue.call(this, data);
        }.bind(this)
      );
    }
  }

  write(data, callback) {
    if (typeof data !== "string") return;
    this.#WriteQueue.push([data, callback]);
    this.count++;
    this.#processWriteQueue();
  }

  #processWriteQueue() {
    if (!this.#WriteQueue || !this.isReady) return;
    var next = this.#WriteQueue.shift();
    if (!next) return;
    this.#port.write(next[0], "utf8", next[1]);
    if (this.#debugging.logWriting) {
      console.log("Writing:", this.#cmdHandler.parseLog(next[0]));
    }
    if (this.#WriteQueue.length > 0) this.#processWriteQueue();
  }

  read(id, callback) {
    if (typeof id == "number") id = id.toString();
    if (typeof id !== "string") return new Promise();
    var time = this.timeoutMS == -1 ? -1 : Date.now();
    return new Promise(
      function (resolve, reject) {
        this.#ReadQueue.push([
          id,
          { resolve: resolve, reject: reject },
          callback,
          time,
        ]);
      }.bind(this)
    );
  }

  #processReadQueue(data) {
    if (!this.#ReadQueue || !this.isReady || typeof data !== "string") return;
    var message = "Reading: " + this.#cmdHandler.parseLog(data);
    var next, matcher;
    for (let i = 0; i < this.#ReadQueue.length; i++) {
      next = this.#ReadQueue[i];
      var matcher;
      if (this.readOrdering == "loose") {
        data = this.#cmdHandler.parseOutput(
          data.charAt(0) + data.slice(1).replaceAll("#", "")
        );
        matcher = data.id.replace("#", "");
      } else matcher = data.split(" ")[1].replace("#", "");
      if (next[0] == matcher) {
        this.#ReadQueue.splice(i, 1);
        message += " - match";
        if (this.readOrdering == "strict") {
          data = this.#cmdHandler.parseOutput(
            data.charAt(0) + data.slice(1).replaceAll("#", "")
          );
        }
        if (typeof next[2] == "function") next[2](data);
        if (next[1] && next[1].resolve) next[1].resolve(data);
      } else if (next[3] !== -1 && this.timeoutMS < Date.now() - next[3]) {
        if (this.#debugging.logReading) console.warn("Timeout");
        next[1].reject();
      }
    }
    if (this.#debugging.logReading) console.log(message);
  }

  sendCommand(id, ...args) {
    if (typeof id !== "string") return;
    this.write(this.#cmdHandler.parseInput(id, args, this.count));
  }
  pinMode(pin, mode = false) {
    if (!this.validPin(pin) || typeof mode !== "boolean") return;
    var data = this.#cmdHandler.parseInput(
      "setPinMode",
      {
        pin: pin.substring(1),
        mode: +mode,
      },
      this.count
    );
    this.write(data);
  }

  readPin(pin, callback) {
    if (!this.validPin(pin)) return;
    let count = this.count;
    var data = this.#cmdHandler.parseInput(
      "readDigitalPin",
      {
        pin: pin.substring(1),
      },
      count
    );
    this.write(data);
    return this.read(
      count,
      function (id, callback, data) {
        if (this.#cache && id && typeof parseInt(data.args.value) == "number") {
          this.#cache[id] = parseInt(data.args.value);
        }
        if (typeof callback == "function") callback(data);
      }.bind(this, pin, callback)
    );
  }

  setPin(pin, value = 0) {
    value = formatValue(value, pin.includes("A"));
    if (!this.validPin(pin) || typeof value !== "number") return;
    if (this.#cache && this.#cache[pin] == value) return;
    var data = this.#cmdHandler.parseInput(
      "setDigitalPin",
      {
        pin: pin.substring(1),
        value: value,
      },
      this.count
    );
    this.write(data);
    if (this.#cache) this.#cache[pin] = value;
  }

  readCache(id) {
    if (this.#cache) return this.#cache[id];
  }

  updateCache() {
    if (!this.#cache) return;
    for (let i of Object.keys(this.#cache)) {
      this.readPin(
        i,
        function (id, data) {
          if (data.args && typeof parseInt(data.args.value) == "number") {
            this.#cache[id] = data.args.value;
          }
        }.bind(this, i)
      );
    }
  }

  closeSerial() {
    this.#port.close();
  }

  openSerial(openCallback) {
    this.#port.open(openCallback);
  }

  isOpen() {
    return this.#port.isOpen || false;
  }

  static getAvailiablePorts() {
    return SerialPort.list();
  }

  validPin(pin) {
    return this.board.pins.includes(pin);
  }

  debugMode(options) {
    if (!options) return;
    for (const i of Object.keys(options)) {
      if (typeof this.#debugging[i] === typeof options[i]) {
        this.#debugging[i] = options[i];
      }
    }
  }

  createComponent(cls, options = {}) {
    if (!isClass(cls)) throw Error("Invalid Component!");
    if (!isObject(options)) throw Error("Invalid Options");
    if (arguments.length == 1) {
      return function (options) {
        if (!isObject(options)) throw Error("Could not create Component");
        options.board = this;
        return new cls(options);
      }.bind(this);
    } else return new cls((options.board = this));
  }
}

module.exports = AndruinoInterface;
