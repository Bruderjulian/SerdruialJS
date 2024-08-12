"use strict";
exports.SerialPort = void 0;
const { SerialPortStream } = require("@serialport/stream");
const { MockBinding } = require("@serialport/binding-mock");

class SerialPort extends SerialPortStream {
  static list = MockBinding.list;
  static binding = MockBinding;
  constructor(options, openCallback) {
    const opts = {
      binding: MockBinding,
      ...options,
    };
    super(opts, openCallback);
  }
}

exports.SerialPort = SerialPort;
