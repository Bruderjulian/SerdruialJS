var BoardData = {
  Settings: {
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
    Parser: {
      readline: "readline",
    },
    InputIdentifier: "#+",
    OutputIdentifier: "#-",
    maxArguments: 4,
    pinModes: { input: true, output: false, on: true, off: false },
  },
  boards: {
    Andruino_Uno: "D2-D13/A1-A5/TX/RX",
  },
};

module.exports = { boards: BoardData.boards, Settings: BoardData.Settings };
