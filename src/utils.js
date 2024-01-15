const { pinModes, pinTypes, baudRates } = require("./Configs/PublicConfigs.js");

function parsePinData(data) {
  if (typeof data !== "string") return;
  var pins = [];
  var tokens = data.split("/");
  for (let i = 0; i < tokens.length; i++) {
    const idx = tokens[i].indexOf("-");
    if (idx === -1) {
      pins.push(tokens[i]);
      continue;
    }
    const start = parseInt(tokens[i].slice(1, idx), 10);
    const end = parseInt(tokens[i].slice(idx + 2), 10);
    if (isNaN(start) || isNaN(end) || end < start) {
      console.error("Invalid Pin Data");
      continue;
    }
    for (let i = start; i <= end; i++) {
      pins.push(`${tokens[i].slice(0, 1)}${i}`);
    }
  }
  return pins;
}
/*
function createData() {
  var out = Settings.InputIdentifier;
  var len = Math.min(arguments.length, Settings.maxArguments);
  for (let i = 0; i < len; i++) {
    let endChar = i == len - 1 ? "\n" : " ";
    if (arguments[i] != undefined) out += arguments[i] + endChar;
  }
  return out;
}
*/
function validBaudRate(rate) {
  return baudRates.hasOwnProperty("$" + rate);
}

function validBoard(obj) {
  return (
    isObject(obj) &&
    typeof obj.name == "string" &&
    obj.name !== "" &&
    typeof obj.pinData == "string"
  );
}

function validPort(str) {
  return (
    (typeof str === "string" &&
      (str.includes("COM") || str.includes("/dev/tty"))) ||
    str == "" ||
    str == undefined
  );
}

function formatValue(value, isAnalog = false) {
  value = parseInt(+value, 10);
  if (typeof value !== "number") return 0;
  return Math.max(Math.min(Math.round(Math.abs(value)), isAnalog ? 255 : 1), 0);
}

function isClass(v) {
  return typeof v === "function" && /^\s*class\s+/.test(v.toString());
}

function isObject(obj) {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}

function toObject(arr, keys = []) {
  if (isObject(arr)) return arr;
  if (!Array.isArray(arr)) return;
  var newObj = {};
  let useKeys = Array.isArray(keys);
  for (let i = 0; i < arr.length; i++) {
    newObj[useKeys ? keys[i] : i] = arr[i];
  }
  return newObj;
}

function validatePin(data) {
  var pin, type, mode;
  if (typeof data == "number" || typeof data == "string") {
    pin = data.toString();
    type = "digital";
    mode = "output";
  } else if (isObject(data)) {
    pin = data.pin;
    type = data.type || "digital";
    mode = data.mode || "output";
  } else throw Error("Invalid Pin data");

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
    !pinModes.includes(mode) ||
    !Object.keys(pinTypes).includes(type) ||
    (this.validPin && !this.validPin(pin))
  ) {
    throw Error("Invalid Pin data");
  }
  return {
    pin: pin,
    type: type,
    mode: mode,
  };
}

module.exports = {
  formatValue,
  parsePinData,
  validBaudRate,
  validBoard,
  validPort,
  isClass,
  isObject,
  toObject,
  validatePin,
};
