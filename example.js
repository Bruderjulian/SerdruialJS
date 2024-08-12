var {
  AndruinoInterface,
  Boards,
  Configs,
  Components: { Led },
} = require("./index.js");
const testPlugin = require("./plugin.js");
//AndruinoInterface.getAvailiablePorts().then(console.log);

var controller = new AndruinoInterface(
  {
    baudRate: Configs.baudRates.$9600,
    path: "COM3",
    readOrdering: Configs.readOrdering.strict,
    debugging: {
      logWriting: true,
      logReading: true,
    },
    caching: false,
    //plugins: testPlugin,
  },
  Boards.Andruino_Uno
);

var led = controller.createComponent(Led)({ pin: "D13" });

controller
  .readPin("D13")
  .then(function (data) {
    console.log(data);
  })
  .catch(function (e) {
    console.error(e);
  });

led.init();
//led.strobe(1000);
setInterval(function () {
  led.on();
}, 2000);
setTimeout(function () {
  setInterval(function () {
    led.off()
  }, 2000)
}, 1000)
