const Component = require("../src/Components/Component.js");
const utils = require("../src/utils.js");

describe("Test Utility isObject", function () {
  it("check Objects", function () {
    expect(utils.isObject({})).toBe(true);
  });
  it("check Objects deep", function () {
    expect(utils.isObject({ bar: "test" })).toBe(true);
  });
  it("check Null", function () {
    expect(utils.isObject(null)).toBe(false);
  });
  it("check NaN", function () {
    expect(utils.isObject(NaN)).toBe(false);
  });
  it("check Arrays", function () {
    expect(utils.isObject([])).toBe(false);
  });
  it("check Strings", function () {
    expect(utils.isObject("")).toBe(false);
  });
  it("check Booleans", function () {
    expect(utils.isObject(true)).toBe(false);
  });
});

describe("Test Utility convert2ms", function () {
  it("check bool", function () {
    expect(() => utils.convertMS(true)).toThrowError(
      "Can't convert 'true' to Milliseconds"
    );
  });
  it("check Object", function () {
    expect(() => utils.convertMS({})).toThrowError(
      "Can't convert '[object Object]' to Milliseconds"
    );
  });
  it("check NaN", function () {
    expect(() => utils.convertMS(NaN)).toThrowError(
      "Can't convert 'NaN' to Milliseconds"
    );
  });
  it("check Null", function () {
    expect(() => utils.convertMS(null)).toThrowError(
      "Can't convert 'null' to Milliseconds"
    );
  });
  it("check Numbers", function () {
    expect(utils.convertMS(1)).toBe(1);
  });
  it("check Numbers", function () {
    expect(utils.convertMS(60000)).toBe(60000);
  });
  it("check Strings", function () {
    expect(utils.convertMS("60000 ")).toBe(60000);
  });
  it("check Strings", function () {
    expect(utils.convertMS("60000ms")).toBe(60000);
  });
  it("check Strings", function () {
    expect(utils.convertMS("1min")).toBe(60000);
  });

  it("check Numbers pretty", function () {
    expect(utils.convertMS(1, true)).toBe("1ms");
  });
  it("check Numbers pretty", function () {
    expect(utils.convertMS(60000, true)).toBe("1min");
  });
  it("check Strings pretty", function () {
    expect(utils.convertMS("60000", true)).toBe("1min");
  });
  it("check Strings pretty", function () {
    expect(utils.convertMS("60000ms", true)).toBe("1min");
  });
  it("check Strings pretty", function () {
    expect(utils.convertMS("60sec", true)).toBe("1min");
  });
});

describe("Test Utility toObject", function () {
  it("check Objects", function () {
    expect(utils.toObject({})).toEqual({});
  });
  it("check Objects", function () {
    expect(utils.toObject({ foo: "bar" })).toEqual({ foo: "bar" });
  });
  it("check Objects", function () {
    expect(utils.toObject(true)).toBe(undefined);
  });

  it("convert empty Array", function () {
    expect(utils.toObject([])).toEqual({});
  });
  it("convert Array without Keys", function () {
    expect(utils.toObject([1, 2])).toEqual({ 0: 1, 1: 2 });
  });
  it("convert Array with Keys", function () {
    expect(utils.toObject([1, 2], ["f", "g"])).toEqual({ f: 1, g: 2 });
  });
  it("convert Array with partial Keys", function () {
    expect(utils.toObject([1, 2], ["f"])).toEqual({ f: 1, 1: 2 });
  });
});

describe("Test Utility toObject", function () {
  it("check Objects 1", function () {
    expect(utils.isComponent(String)).toBe(false);
  });
  it("check Objects 2", function () {
    expect(utils.isComponent({})).toBe(false);
  });
  it("check Functions 1", function () {
    expect(utils.isComponent(Function)).toBe(false);
  });
  it("check Functions 2", function () {
    expect(utils.isComponent(function () {})).toBe(false);
  });
  it("check Class", function () {
    expect(utils.isComponent(class {})).toBe(false);
  });
  it("check Component", function () {
    let test = class extends Component {};
    expect(utils.isComponent(test)).toBe(true);
  });
});

describe("Test Utility validCommand", function () {
  let command = {
    name: "",
    input: "",
    description: "",
    output: "",
  };
  it("check other", function () {
    expect(utils.validCommand(false)).toBe(false);
  });
  it("check Objects", function () {
    expect(utils.validCommand({})).toBe(false);
  });
  it("check Command 1", function () {
    expect(utils.validCommand(command)).toBe(false);
  });
  it("check Command 2", function () {
    command.input = "d";
    command.name = "f";
    expect(utils.validCommand(command)).toBe(true);
  });
});

describe("Test Utility validBoard", function () {
  let board = {
    name: "",
    pinData: "",
  };
  it("check other", function () {
    expect(utils.validBoard(false)).toBe(false);
  });
  it("check Objects", function () {
    expect(utils.validBoard({})).toBe(false);
  });
  it("check Board 1", function () {
    expect(utils.validBoard(board)).toBe(false);
  });
  it("check Board 2", function () {
    board.pinData = "d";
    board.name = "f";
    expect(utils.validBoard(board)).toBe(true);
  });
});

describe("Test Utility validPort", function () {
  it("check other 1", function () {
    expect(utils.validPort(false)).toBe(false);
  });
  it("check other 2", function () {
    expect(utils.validPort({})).toBe(false);
  });
  it("check String 1", function () {
    expect(utils.validPort("dfg")).toBe(false);
  });
  it("check String 2", function () {
    expect(utils.validPort("com")).toBe(false);
  });

  it("check Port 1", function () {
    expect(utils.validPort("com1")).toBe(true);
  });
  it("check Port 2", function () {
    expect(utils.validPort("/dev/ttyUSB0")).toBe(true);
  });

  it("check undefined", function () {
    expect(utils.validPort(undefined)).toBe(true);
  });
  it("check empty", function () {
    expect(utils.validPort("")).toBe(true);
  });
});

describe("Test Utility validBaudRate", function () {
  it("check other 1", function () {
    expect(utils.validBaudRate(false)).toBe(false);
  });
  it("check other 2", function () {
    expect(utils.validBaudRate(undefined)).toBe(false);
  });
  it("check other 3", function () {
    expect(utils.validBaudRate(NaN)).toBe(false);
  });
  it("check Numbers 1", function () {
    expect(utils.validBaudRate("$9600")).toBe(false);
  });
  it("check Numbers 2", function () {
    expect(utils.validBaudRate(9)).toBe(false);
  });
  [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200].forEach(function (
    val,
    idx
  ) {
    it("check baudRate " + idx, function () {
      expect(utils.validBaudRate(val)).toBe(true);
    });
  });
});

describe("Test Utility parsePinData", function () {
  it("check other 1", function () {
    expect(() => utils.parsePinData(false)).toThrowError();
  });
  it("check Strings 1", function () {
    expect(() => utils.parsePinData("")).toThrowError();
  });
  it("check Strings 2", function () {
    expect(utils.parsePinData("/")).toEqual(["", ""]);
  });
  it("check Strings 3", function () {
    expect(utils.parsePinData("W/j")).toEqual(["W", "j"]);
  });
  it("check Strings 5", function () {
    expect(() => utils.parsePinData("-/-")).toThrowError();
  });

  it("check Data 1", function () {
    expect(utils.parsePinData("1/3")).toEqual(["1", "3"]);
  });
  it("check Data 2", function () {
    expect(utils.parsePinData("D1/D3")).toEqual(["D1", "D3"]);
  });
  it("check Data 3", function () {
    expect(utils.parsePinData("D1-D3")).toEqual(["D1", "D2", "D3"]);
  });
  it("check Data 4", function () {
    expect(utils.parsePinData("D1-D3/D5")).toEqual(["D1", "D2", "D3", "D5"]);
  });
});

describe("Test Utility formatValue", function () {
  it("check other 1", function () {
    expect(utils.formatValue("")).toEqual(0);
  });
  it("check other 2", function () {
    expect(utils.formatValue([])).toEqual(0);
  });
  it("check other 3", function () {
    expect(utils.formatValue("", true)).toEqual(0);
  });
  it("check other 4", function () {
    expect(utils.formatValue([], true)).toEqual(0);
  });
  it("check bool 1", function () {
    expect(utils.formatValue(false)).toEqual(0);
  });
  it("check bool 2", function () {
    expect(utils.formatValue(true)).toEqual(1);
  });
  it("check bool 3", function () {
    expect(utils.formatValue(false, true)).toEqual(0);
  });
  it("check bool 4", function () {
    expect(utils.formatValue(true, true)).toEqual(255);
  });
});

describe("Test Utility Validate Pin Simple", function () {
  let this_ = {
    validPin: function (pin) {
      return pin === "D1" || pin === "A1" || pin === "D2" || pin === "A2";
    },
  };
  let result = { pin: "D1", type: "digital", mode: "output" };
  let result2 = { pin: "A1", type: "analog", mode: "output" };
  it("check other 1", function () {
    expect(() => utils.validatePin.call(this_, "")).toThrowError();
  });
  it("check other 2", function () {
    expect(() => utils.validatePin.call(this_, {})).toThrowError();
  });
  it("check other 3", function () {
    expect(() => utils.validatePin.call(this_, true)).toThrowError();
  });
  it("check Number 1", function () {
    result.pin = "D1";
    expect(utils.validatePin.call(this_, 1)).toEqual(result);
  });
  it("check Number 2", function () {
    result.pin = "D2";
    expect(utils.validatePin.call(this_, 2)).toEqual(result);
  });

  it("check String 1", function () {
    result.pin = "D1";
    expect(utils.validatePin.call(this_, "1")).toEqual(result);
  });
  it("check String 2", function () {
    result.pin = "D1";
    expect(utils.validatePin.call(this_, "D1")).toEqual(result);
  });
  it("check String 3", function () {
    expect(utils.validatePin.call(this_, "A1")).toEqual(result2);
  });
});

describe("Test Utility Validate Pin Complex", function () {
  let this_ = {
    validPin: function (pin) {
      return pin === "D1" || pin === "A1" || pin === "D2" || pin === "A2";
    },
  };
  let result = { pin: "D1", type: "digital", mode: "output" };
  let result2 = { pin: "A1", type: "analog", mode: "output" };
  it("check Object 1", function () {
    expect(utils.validatePin.call(this_, { pin: 1 })).toEqual(result);
  });
  it("check Object 2", function () {
    expect(utils.validatePin.call(this_, { pin: "1" })).toEqual(result);
  });
  it("check Object 3", function () {
    expect(utils.validatePin.call(this_, { pin: "D1" })).toEqual(result);
  });
  it("check Object 4", function () {
    expect(utils.validatePin.call(this_, { pin: "A1" })).toEqual(result2);
  });
  it("check Object 5", function () {
    result2.mode = "input";
    expect(
      utils.validatePin.call(this_, {
        pin: "A1",
        type: "analog",
        mode: "input",
      })
    ).toEqual(result2);
  });
  it("check Object 6", function () {
    result2.mode = "output";
    expect(
      utils.validatePin.call(this_, {
        pin: "A1",
        type: "analog",
        mode: "output",
      })
    ).toEqual(result2);
  });
  it("check Object 7", function () {
    result.mode = "input";
    expect(
      utils.validatePin.call(this_, {
        pin: "D1",
        type: "digital",
        mode: "input",
      })
    ).toEqual(result);
  });
  it("check Object 8", function () {
    result.mode = "output";
    expect(
      utils.validatePin.call(this_, {
        pin: "D1",
        type: "digital",
        mode: "output",
      })
    ).toEqual(result);
  });
});

describe("Test Utility Validate Pin Errors", function () {
  let this_ = {
    validPin: function (pin) {
      return pin === "D1" || pin === "A1" || pin === "D2" || pin === "A2";
    },
  };
  let result = { pin: "D1", type: "digital", mode: "output" };
  let result2 = { pin: "A1", type: "analog", mode: "output" };
  it("check Object 1", function () {
    expect(() =>
      utils.validatePin.call(this_, { type: "digital" })
    ).toThrowError();
  });
  it("check Object 2", function () {
    expect(() =>
      utils.validatePin.call(this_, { type: "analog" })
    ).toThrowError();
  });
  it("check Object 3", function () {
    expect(() =>
      utils.validatePin.call(this_, { mode: "input" })
    ).toThrowError();
  });
  it("check Object 4", function () {
    expect(() =>
      utils.validatePin.call(this_, { type: "analog", mode: "output" })
    ).toThrowError();
  });
  it("check Object 5", function () {
    expect(() =>
      utils.validatePin.call(this_, {
        pin: "A1",
        type: "digital",
      })
    ).toThrowError();
  });
  it("check Object 6", function () {
    expect(() =>
      utils.validatePin.call(this_, {
        pin: "D1",
        type: "analog",
      })
    ).toThrowError();
  });
});
