"use strict";
exports.SerialPort = void 0;
const { SerialPortStream } = require("@serialport/stream");
const Bindings = require("@serialport/bindings-cpp");

var DetectedBinding;
if (typeof Bindings.autoDetect == "function") {
  DetectedBinding = Bindings.autoDetect();
}

class SerialPort extends SerialPortStream {
  static list = DetectedBinding.list;
  static binding = DetectedBinding;
  constructor(options, openCallback) {
    const opts = {
      binding: DetectedBinding,
      ...options,
    };
    super(opts, openCallback);
  }
}

exports.SerialPort = SerialPort;
