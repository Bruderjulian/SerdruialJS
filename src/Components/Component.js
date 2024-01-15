const { isClass } = require("../utils");

class Component {
  constructor(board) {
    if (!global.BoardInstances.includes(board) && board !== undefined) {
      throw Error("Invalid Board");
    }
    this.board =
      board || global.BoardInstances[global.BoardInstances.length - 1];
  }

  get getComponentName() {
    return this.constructor.name;
  }
}

module.exports = Component;
