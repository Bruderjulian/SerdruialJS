const { SerialPort } = require("../lib/serialport.js");
const { DelimiterParser } = require("@serialport/parser-delimiter");
const { ReadyParser } = require("@serialport/parser-ready");
const cmdHandler = require("./ArdruinoCommands.js");
const { PluginHandler } = require("./PluginLoader.js");
const {
  parsePinData,
  formatValue,
  validBaudRate,
  isComponent,
  isObject,
  validPort,
  convertMS,
} = require("./utils.js");
const InternalConfigs = require("./Configs/InternalConfigs.js");
const Boards = require("./Configs/Boards.js").Boards;
global.BoardInstances = [];
global.ComponentNames = [];

class ArdruinoInterface {
  #debugging = {};
  #cache = {};
  #port;
  #parser;
  #WriteQueue = [];
  #ReadQueue = [];
  #cmdHandler;
  #count = 0;
  #isReady = false;
  #board;
  #readOrdering = "loose";
  #timeoutMS = 3000;
  constructor(options = {}, boardName, openCallback) {
    if (!isObject(options)) throw new TypeError("Options is not an Object");
    var portOptions = {
      path: options.path || InternalConfigs.defaults.path,
      baudRate: options.baudRate || InternalConfigs.defaults.baudrate,
      autoOpen: options.autoOpen || InternalConfigs.defaults.autoOpen,
    };
    if (
      !validPort(portOptions.path.toLowerCase()) ||
      !validBaudRate(portOptions.baudRate) ||
      typeof portOptions.autoOpen !== "boolean"
    ) {
      throw SyntaxError("Invalid Port Options");
    }
    this.#readOrdering =
      options.readOrdering || InternalConfigs.defaults.readOrdering;
    this.#timeoutMS = convertMS(
      (options.timeoutMS || InternalConfigs.defaults.timeoutMS).toString()
    );
    if (
      (this.#readOrdering !== "loose" && this.#readOrdering !== "strict") ||
      typeof options.timeoutMS == "number"
    ) {
      throw SyntaxError("Invalid Communication Options");
    }
    this.#debugging = {
      logWriting: InternalConfigs.defaults.debuggingLogging,
      logReading: InternalConfigs.defaults.debuggingLogging,
    };
    if (isObject(options.debugging)) {
      this.#debugging.logWriting =
        options.debugging.logWriting || this.#debugging.logWriting;
      this.#debugging.logReading =
        options.debugging.logReading || this.#debugging.logReading;
    }
    if (
      typeof this.#debugging.logWriting !== "boolean" ||
      typeof this.#debugging.logReading !== "boolean"
    ) {
      throw SyntaxError("Invalid Debugging Options");
    }
    if (!isObject(options.plugins) && options.plugins != undefined) {
      throw new SyntaxError("Invalid Plugin Options");
    }
    //setup
    this.#isReady = false;
    this.#count = 0;
    this.#WriteQueue = [];
    this.#ReadQueue = [];
    const pluginData = {};
    if (options.plugins)
      pluginData = PluginHandler.handlePlugins(options.plugins);
    this.#cmdHandler = new cmdHandler(
      Object.assign(InternalConfigs.commands, pluginData.commands),
      InternalConfigs.InputIdentifier,
      InternalConfigs.CommandSuffix,
      InternalConfigs.OutputIdentifier
    );
    this.#board = Boards[boardName] || pluginData.boards[boardName];
    if (!this.#board) {
      throw new Error("Could not find the Board Specification");
    }
    this.#board.pins = parsePinData(this.#board.pinData);
    if (options.caching == true) {
      this.#cache = this.#board.pins.reduce(
        (acc, curr) => ((acc[curr] = 0), acc),
        {}
      );
    }
    global.BoardInstances.push(this);
    this.#initSerialPort(portOptions, openCallback);
  }

  async #initSerialPort(portOptions, openCallback) {
    console.log(
      "Connecting to: " + this.#board.name + " (" + portOptions.path + ")"
    );
    this.#port = new SerialPort(portOptions, function () {
      if (typeof openCallback == "function") openCallback();
    });
    this.#port.on("error", function (err) {
      throw Error(err);
    });
    this.#port.on("close", function () {
      console.log("Port Closed");
    });
    const func = function () {
      this.closeSerial();
      setTimeout(() => process.exit(), 100);
    }.bind(this);
    process.on("SIGINT", func); // CTRL+C
    process.on("SIGQUIT", func); // Keyboard quit
    process.on("SIGTERM", func); // `kill` command
    this.#initParser();
  }

  /*
  async findBoard() {
    var availiable = await SerialPort.list();
    if (!availiable) throw new Error("Found no availiable Board");
    availiable = availiable.find(function (val) {
      return (
        typeof val.friendlyName == "string" &&
        val.friendlyName.toLowerCase().includes(boardName.toLowerCase())
      );
    });
    if (!availiable) throw new Error("No matching Board found");
    return availiable.path;
  }
  */

  #initParser() {
    if (!this.#isReady) {
      this.#parser = this.#port.pipe(new ReadyParser({ delimiter: "#-Ready" }));
      var self = this;
      this.#parser.on("ready", function () {
        console.log("Connection is Ready");
        self.#isReady = true;
        self.#initParser();
        self.#processWriteQueue();
      });
      return;
    }
    this.#port.unpipe();
    this.#parser = this.#port.pipe(
      new DelimiterParser({
        delimiter: Buffer.from("\r\n", "utf8"),
        encoding: "utf8",
      })
    );
    this.#parser.on(
      "data",
      function (data) {
        data = data.trim();
        if (data != "") this.#processReadQueue.call(this, data);
      }.bind(this)
    );
  }

  write(data, callback) {
    if (typeof data !== "string") return;
    this.#WriteQueue.push([data, callback]);
    this.#count++;
    this.#processWriteQueue();
  }

  #processWriteQueue() {
    if (!this.#WriteQueue || !this.#isReady) return;
    var next = this.#WriteQueue.shift();
    if (!next) return;
    this.#port.write(next[0], "utf8", next[1]);
    if (this.#debugging.logWriting) {
      console.log(this.#cmdHandler.parseLog(next[0]));
    }
    if (this.#WriteQueue.length > 0) this.#processWriteQueue();
  }

  read(id, callback) {
    if (typeof id == "number") id = id.toString();
    if (typeof id !== "string") return new Promise();
    var time = this.#timeoutMS == -1 ? -1 : Date.now();
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
    if (!this.#ReadQueue || !this.#isReady || typeof data !== "string") return;
    var message = "Reading: " + this.#cmdHandler.parseLog(data);
    var next, matcher;
    for (let i = 0; i < this.#ReadQueue.length; i++) {
      next = this.#ReadQueue[i];
      var matcher;
      if (this.#readOrdering == "loose") {
        data = this.#cmdHandler.parseOutput(data);
        matcher = data.id.replace("#", "");
      } else matcher = data.split(" ")[1].replace("#", "");
      if (next[0] == matcher) {
        this.#ReadQueue.splice(i, 1);
        message += " - match";
        if (this.#readOrdering == "strict") {
          data = this.#cmdHandler.parseOutput(data);
        }
        if (typeof next[2] == "function") next[2](data);
        if (next[1] && next[1].resolve) next[1].resolve(data);
      } else if (next[3] !== -1 && this.#timeoutMS < Date.now() - next[3]) {
        if (this.#debugging.logReading) console.warn("Timeout");
        next[1].reject();
      }
    }
    if (this.#debugging.logReading) console.log(message);
  }

  sendCommand(id, ...args) {
    if (typeof id !== "string") return;
    this.write(this.#cmdHandler.parseInput(id, args, this.#count));
  }
  pinMode(pin, mode = false) {
    if (!this.validPin(pin) || typeof mode !== "boolean") return;
    var data = this.#cmdHandler.parseInput(
      "setPinMode",
      {
        pin: pin.substring(1),
        mode: +mode,
      },
      this.#count
    );
    this.write(data);
  }

  readPin(pin, callback) {
    if (!this.validPin(pin)) return;
    let count = this.#count;
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
      function (pin, callback, data) {
        if (
          this.#cache &&
          pin &&
          typeof parseInt(data.args.value) == "number"
        ) {
          this.#cache[pin] = parseInt(data.args.value);
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
      this.#count
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
    if (this.#port.isOpen) this.#port.close();
  }

  openSerial(openCallback) {
    if (!this.#port.isOpen) this.#port.open(openCallback);
  }

  static getAvailiablePorts() {
    return SerialPort.list();
  }

  validPin(pin) {
    return this.#board.pins.includes(pin);
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
    if (!isComponent(cls)) throw Error("Invalid Component");
    if (!isObject(options)) throw Error("Invalid Options");
    if (arguments.length == 1) {
      return function (options) {
        if (!isObject(options)) throw Error("Could not create Component");
        options.board = this;
        return new cls(options);
      }.bind(this);
    } else return new cls((options.board = this));
  }

  /**
   * @param {number} ms
   */
  set timeoutMS(ms) {
    this.#timeoutMS = convertMS(
      (ms || this.#timeoutMS || InternalConfigs.defaults.timeoutMS).toString()
    );
  }

  /**
   * @param {string} ordering
   */
  set readOrdering(ordering) {
    if (ordering !== "loose" && ordering !== "strict") {
      ordering = this.#readOrdering || InternalConfigs.defaults.readOrdering;
    }
    this.#readOrdering = ordering;
  }

  get board() {
    return this.#board;
  }

  get boardCount() {
    return this.#count;
  }

  get isOpen() {
    return this.#port.isOpen || false;
  }

  get isReady() {
    return this.#port.isReady || false;
  }
}

module.exports = ArdruinoInterface;
