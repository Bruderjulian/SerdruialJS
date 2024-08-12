const { isObject, toObject, validCommand } = require("./utils");

class CommandHandler {
  #commands = {};
  #InPrefix;
  #OutPrefix;
  #InSuffix;
  #OutSuffix;
  constructor(commandData, InPrefix = "", InSuffix = "", OutPrefix, OutSuffix) {
    this.#InPrefix = InPrefix;
    this.#OutPrefix = OutPrefix || InPrefix;
    this.#InSuffix = InSuffix;
    this.#OutSuffix = OutSuffix || InSuffix;
    if (typeof InPrefix !== "string" || typeof this.#OutPrefix !== "string")
      throw TypeError("Invalid Prefix");
    if (typeof InSuffix !== "string" || typeof this.#OutSuffix !== "string")
      throw TypeError("Invalid Suffix");
    this.#commands = {};
    this.addCommands(commandData);
  }

  // Input: #+id hash param1 param2
  parseInput(name, args = {}, hash = 0) {
    if (!this.#commands.hasOwnProperty(name)) {
      console.error("Command does'nt exists");
      return;
    }
    if (Array.isArray(args)) {
      let neededArgs = this.#extractArgs(this.#commands[name].input);
      args = toObject(args, neededArgs);
    } else if (!isObject(args)) throw Error("Invalid Args");
    var input = this.#commands[name].input;
    if (!input.startsWith(this.#InPrefix)) input = this.#InPrefix + input;
    if (!input.endsWith(this.#InSuffix)) input += this.#InSuffix;
    if (typeof hash == "number") args.hash = "#" + hash;
    else args.hash = "#0";
    return this.#applyArgs(input, args);
  }

  // Output: #-id hash param1 param2
  parseOutput(data, mode = "output") {
    if (typeof data !== "string") return;
    var id = this.detectCommand(data, mode);
    if (!id) return;
    var args = this.#extractArgs(this.#commands[id][mode]);
    return {
      id: id,
      args: this.#deapplyArgs(data.replace("\n", ""), args),
    };
  }

  parseLog(data, args) {
    if (typeof data !== "string") return data;
    if (this.#commands.hasOwnProperty(data)) {
      return this.#applyArgs(this.#commands[data].description, args);
    } else var out = this.parseOutput(data, "input");
    if (!out || !this.#commands.hasOwnProperty(out.id)) return data;
    return this.#applyArgs(this.#commands[out.id].description, out.args);
  }

  addCommands(commandsData) {
    if (validCommand(commandsData)) {
      this.addCommand(commandsData);
      return;
    } else if (isObject(commandsData)) {
      commandsData = Object.values(commandsData);
    } else if (!Array.isArray(commandsData)) {
      throw SyntaxError("Invalid Commands Structure");
    }
    for (let i = 0; i < commandsData.length; i++) {
      this.addCommand(commandsData[i]);
    }
  }

  addCommand(commandData) {
    if (!validCommand(commandData)) throw SyntaxError("Invalid Command");
    this.#commands[commandData.name] = {
      ...commandData,
      pattern: {
        input: this.#createPattern(commandData.input),
        output: this.#createPattern(commandData.output),
      },
    };
  }

  removeCommands(commandsData) {
    this.#commands = commandsData.reduce((o, k) => {
      const { [k]: _, ...p } = o;
      return p;
    }, this.#commands);
  }

  existCommands(ids, mergeResult = false) {
    if (!Array.isArray(ids)) {
      return this.#commands.hasOwnProperty(ids);
    }
    var result = mergeResult ? false : [];
    for (let i = 0; i < ids.length; i++) {
      if (mergeResult) {
        result |= this.#commands.hasOwnProperty(ids);
      } else {
        result.push(this.#commands.hasOwnProperty(ids));
      }
    }
    return result;
  }

  detectCommand(data, mode) {
    if (mode !== "output" && mode !== "input") mode = "input";
    if (mode == "input") {
      data = data.replace(this.#InSuffix, "").replace(this.#InPrefix, "");
    } else {
      data = data.replace(this.#OutSuffix, "").replace(this.#OutPrefix, "");
    }
    data = data.charAt(0) + data.slice(1).replaceAll("#", "");
    return Object.keys(this.#commands).find((key) =>
      this.#commands[key].pattern[mode].test(data)
    );
  }

  #extractArgs(str) {
    const matcher = new RegExp(`%(.*?) `, "gm");
    let matches = (str + " ").match(matcher);
    if (!matches) return [];
    return matches.map((str) => str.slice(1, -1));
  }

  #applyArgs(str, args) {
    if (!isObject(args)) return str;
    for (const i of Object.keys(args)) {
      str = str.replace("%" + i, args[i]);
    }
    return str;
  }

  #deapplyArgs(str, args) {
    if (typeof str !== "string" || !Array.isArray(args)) return;
    if (args.length == 0) return args;
    str = str.split(" ").slice(1);
    var out = {};
    for (let i = 1; i < args.length; i++) {
      out[args[i]] = str[i];
    }
    return out;
  }

  #createPattern(str) {
    if (typeof str !== "string") return;
    var args = this.#extractArgs(str);
    var pattern = str;
    for (let j = 0; j < args.length; j++) {
      pattern = pattern.replace("%" + args[j], "\\d+");
    }
    return new RegExp(`^${pattern}$`);
  }
}

module.exports = CommandHandler;
