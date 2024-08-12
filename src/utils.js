const { pinModes, pinTypes, baudRates } = require("./Configs/PublicConfigs.js");
const Component = require("./Components/Component.js");

const sec = 1000;
const min = sec * 60;
const hr = min * 60;

function parsePinData(data) {
  if (typeof data !== "string" || data == "")
    throw new Error("Invalid Pin Data");
  var pins = [];
  var tokens = data.split("/");
  var i, j, start, end, idx;
  for (i = 0; i < tokens.length; i++) {
    idx = tokens[i].indexOf("-");
    if (idx === -1) {
      pins.push(tokens[i]);
      continue;
    }
    start = parseInt(tokens[i].slice(1, idx), 10);
    end = parseInt(tokens[i].slice(idx + 2), 10);
    if (isNaN(start) || isNaN(end) || end < start) {
      throw new Error("Invalid Pin Data");
    }
    for (j = start; j <= end; j++) {
      pins.push(`${tokens[i].slice(0, 1)}${j}`);
    }
  }
  return pins;
}

function validBaudRate(rate) {
  return baudRates.hasOwnProperty("$" + rate);
}

function validBoard(obj) {
  return (
    isObject(obj) &&
    typeof obj.name == "string" &&
    obj.name !== "" &&
    typeof obj.pinData == "string" &&
    obj.pinData !== ""
  );
}

function validPort(str) {
  var regex = /^(\/(dev\/[a-zA-Z0-9]+)|com[0-9]+)$/;
  return (
    (typeof str === "string" && regex.test(str)) ||
    str === "" ||
    str === undefined
  );
}

function formatValue(value, isAnalog = false) {
  if (typeof value == "string") value = parseInt(+value, 10);
  if (typeof value == "boolean") {
    value = value ? +value * (254 * isAnalog + 1) : 0;
  }
  if (typeof value !== "number") return 0;
  return Math.floor(
    Math.abs(Math.max(Math.min(+value || 0, isAnalog ? 255 : 1), 0))
  );
}

function isComponent(cls) {
  return (
    typeof cls === "function" &&
    /^\s*class\s+/.test(cls.toString()) &&
    getBaseClass(cls) == Component
  );
}

function validCommand(command) {
  return (
    isObject(command) &&
    typeof command.name == "string" &&
    typeof command.description == "string" &&
    typeof command.input == "string" &&
    typeof command.output == "string" &&
    command.name !== "" &&
    command.input !== "" &&
    !/\d/.test(command.input.split(" ")[0])
  );
}

function getBaseClass(targetClass) {
  if (!(targetClass instanceof Function)) return;
  while (targetClass) {
    const baseClass = Object.getPrototypeOf(targetClass);
    if (baseClass && baseClass !== Object && baseClass.name) {
      targetClass = baseClass;
    } else break;
  }
  return targetClass;
}

function isObject(obj) {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}

function toObject(arr, keys = []) {
  if (isObject(arr)) return arr;
  if (!Array.isArray(arr)) return;
  var newObj = {};
  var usekey = false;
  for (let i = 0; i < arr.length; i++) {
    usekey = Array.isArray(keys) && !!keys[i];
    newObj[(usekey ? keys[i] : i).toString()] = arr[i];
  }
  return newObj;
}

function validatePin(data, limits = {}) {
  var pin, type, mode;
  if (typeof data == "number" || typeof data == "string") {
    pin = data.toString();
    //type = "digital";
    mode = "output";
  } else if (isObject(data)) {
    pin = data.pin;
    type = data.type; // || "digital";
    mode = data.mode || "output";
  } else throw Error("Invalid Pin");

  if (typeof parseInt(pin) === "number" && !isNaN(parseInt(pin))) {
    if (Object.keys(pinTypes).includes(type)) {
      pin = pinTypes[type] + pin.toString();
    } else {
      pin = "D" + pin.toString();
      type = "digital";
    }
  }
  if (!type || type == "") {
    if (pin.includes("D")) type = "digital";
    else if (pin.includes("A")) type = "analog";
    else throw Error("Invalid Pin Type");
  }
  if (
    !Object.values(pinModes).includes(mode) ||
    !Object.keys(pinTypes).includes(type) ||
    (this.validPin && !this.validPin(pin))
  ) {
    throw Error("Invalid Pin");
  }
  if (
    (pin.includes("D") && type == "analog") ||
    (pin.includes("A") && type == "digital")
  ) {
    throw Error("Invalid Pin");
  }
  return {
    pin: pin,
    type: type,
    mode: mode,
  };
}

function convertMS(number, pretty = false) {
  if (typeof number === "string" && number.length > 0) {
    if (pretty == true) {
      return convertFromMS(convert2ms(number));
    } else return convert2ms(number);
  } else if (typeof number !== "number" || !isFinite(number) || isNaN(number)) {
    throw new Error("Can't convert '" + number + "' to Milliseconds");
  } else if (pretty == true) {
    return convertFromMS(number);
  } else return number;
}

function convertFromMS(number) {
  if (!number) {
    throw new Error("Can't convert '" + number + "' to Milliseconds");
  }
  var msAbs = Math.abs(number);
  if (msAbs >= hr) return Math.round(number / hr) + "h";
  else if (msAbs >= min) return Math.round(number / min) + "min";
  else if (msAbs >= sec) return Math.round(number / sec) + "s";
  else return number + "ms";
}

function convert2ms(str) {
  str = String(str);
  if (str.length > 100) return;
  var match =
    /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)?$/i.exec(
      str
    );
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || "ms").toLowerCase();
  switch (type) {
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      return n * hr;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
      return n * min;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      return n * sec;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      return n;
    default:
      return undefined;
  }
}

module.exports = {
  formatValue,
  parsePinData,
  validBaudRate,
  validBoard,
  validPort,
  validCommand,
  isComponent,
  isObject,
  toObject,
  validatePin,
  convertMS,
};
