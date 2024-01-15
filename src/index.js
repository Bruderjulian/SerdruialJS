var components = {
  Led: require("./Components/Led.js"),
  Pin: require("./Components/Pin.js"),
};

module.exports = {
  AndruinoInterface: require("./AndruinoInterface.js"),
  Configs: require("./Configs/PublicConfigs.js"),
  Boards: require("./Configs/Boards.js"),
  Components: components,
};

//Todo: Component initialization, Components, commands, clean up, optimizations, Boards,
