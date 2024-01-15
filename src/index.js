var components = {
  Led: require("./Components/Led.js"),
  Pin: require("./Components/Pin.js"),
};

module.exports = {
  ArdruinoInterface: require("./ArdruinoInterface.js"),
  Configs: require("./Configs/PublicConfigs.js"),
  Boards: require("./Configs/Boards.js"),
  Components: components,
};

//Todo: Components, commands, clean up, optimizations, Boards,
