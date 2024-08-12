var InternalConfigs = {
  defaults: {
    baudrate: 9600,
    autoOpen: true,
    path: "",
    readOrdering: "loose",
    timeoutMS: 3000,
    debuggingLogging: false,
  },
  CommandSuffix: "\n",
  InputIdentifier: "#+",
  OutputIdentifier: "#-",
  commands: {
    echo: {
      name: "echo",
      description: "echo %str",
      input: "echo %hash %str",
      output: "echo %hash %str",
    },
    check: {
      name: "check",
      description: "check %id",
      input: "check %hash %id",
      output: "check %hash %value",
    },
    setPinMode: {
      name: "setPinMode",
      description: "Set Pin %pin to %mode",
      input: "sPM %hash %pin %mode",
      output: "sPM %hash",
    },
    setDigitalPin: {
      name: "setDigitalPin",
      description: "Set Digtal Pin %pin to %value",
      input: "sDP %hash %pin %value",
      output: "sDP %hash",
    },
    readDigitalPin: {
      name: "readDigitalPin",
      description: "Read Digtal Pin %pin",
      input: "rDP %hash %pin",
      output: "rDP %hash %value",
    },
    setAnalogPin: {
      name: "setAnalogPin",
      description: "Set Analog Pin %pin to %value",
      input: "sAP %hash %pin %value",
      output: "sAP %hash",
    },
    readAnalogPin: {
      name: "readAnalogPin",
      description: "Read Analog Pin %pin",
      input: "rAP %hash %pin",
      output: "rAP %hash %value",
    },
  },
};

module.exports = InternalConfigs;
