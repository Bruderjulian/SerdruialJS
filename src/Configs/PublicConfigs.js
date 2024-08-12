var PublicConfigs = {
  baudRates: {
    $300: 300,
    $1200: 1200,
    $2400: 2400,
    $4800: 4800,
    $9600: 9600,
    $19200: 19200,
    $38400: 38400,
    $57600: 57600,
    $115200: 115200,
  },
  pinTypes: {
    digital: "D",
    analog: "A",
    pwm: "D",
  },
  pinModes: { Output: "output", Input: "input" },
  readOrdering: { strict: "strict", loose: "loose" },
};

module.exports = PublicConfigs;
