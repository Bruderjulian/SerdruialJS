var {
  ArdruinoInterface,
  Boards,
  Configs,
  Components: { Led },
} = require("./src/index.js");

var controller = new AndruinoInterface(
  {
    baudRate: Configs.baudRates.$9600,
    path: "COM8",
    readOrdering: Configs.readOrdering.strict,
    debugging: {
      logWriting: true,
      logReading: true,
    },
    caching: false,
  },
  Boards.Ardruino_Uno
);

var led = controller.createComponent(Led)({pin: "D13"});
controller.readPin("D13").then(function (data) {
  console.log(data);
}).catch(function (e) {
  console.error(e);
})
led.init();
led.strobe(1000);
