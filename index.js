var components = {
  Led: require("./src/Components/Led.js"),
  Pin: require("./src/Components/Pin.js"),
};
var Configs = require("./src/Configs/PublicConfigs.js");

module.exports = {
  AndruinoInterface: require("./src/AndruinoInterface.js"),
  Configs: Configs,
  Boards: require("./src/Configs/Boards.js").BoardNames,
  Components: components,
};

/*
Todo
- Components
- Commands
- Boards
- Tests

- Connection Retries
- Checking
*/