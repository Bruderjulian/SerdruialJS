var Boards = {
  Andruino_Uno: { name: "Arduino Uno", pinData: "D0-D13/A1-A5" },
};
var BoardNames = Object.keys(Boards).reduce((a, v) => ({ ...a, [v]: v }), {});

module.exports = { Boards, BoardNames };
