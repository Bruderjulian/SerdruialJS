class Component {
  constructor(board) {
    if (!global.BoardInstances.includes(board) && board !== undefined) {
      throw Error("Invalid Board");
    }
    this._board =
      board || global.BoardInstances[global.BoardInstances.length - 1];
  }
  get ComponentName() {
    return this.constructor.name;
  }
  static get ComponentName() {
    return this.name;
  }
}

module.exports = Component;
