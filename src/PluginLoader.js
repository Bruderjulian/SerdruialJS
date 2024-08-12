const {
  isComponent,
  validBoard,
  isObject,
  validCommand,
} = require("./utils.js");

const hasProp = Object.prototype.hasOwnProperty;
const hasOwn = function (obj, key) {
  return hasProp.call(obj, key);
};

class PluginHandler {
  static #ids = [];
  static #pluginData = {
    components: {},
    boards: {},
    commands: {},
  };
  static handlePlugins(plugins) {
    if (Array.isArray(plugins)) {
      plugins = PluginHandler.#sortPlugins(plugins);
      for (let i = 0, len = plugins.length; i < len; i++) {
        if (!PluginHandler.#validatePlugin(plugins[i])) {
          console.warn("Invalid Plugin");
          continue;
        }
        if (PluginHandler.#ids.includes(plugins[i].$metadata.id)) {
          console.warn("Encountered Plugin with duplicate Id");
          continue;
        }
        PluginHandler.#ids.push(plugins[i].$metadata.id);
        PluginHandler.#loadPlugin(plugins[i]);
      }
      return this.#pluginData;
    }
    if (isObject(plugins) && PluginHandler.#validatePlugin(plugins)) {
      ids.push(plugins.$metadata.id);
      PluginHandler.#loadPlugin(plugins);
      return this.#pluginData;
    };
  }

  static clear() {
    PluginHandler.#pluginData = {
      components: {},
      boards: {},
      commands: {},
    };
  }

  static #loadPlugin(plugin) {
    const keys = Object.keys(PluginHandler.#pluginData);
    let data;
    let entries = 0;
    for (const key of keys) {
      if (!plugin[key]) continue;
      data = Object.values(plugin[key]);
      for (const entry of data) {
        if (key == "boards" && !validBoard(entry)) {
          throw Error("Could not load invalid Board");
        } else PluginHandler.#pluginData.boards[entry.name] = entry;
        if (key == "commands" && !validCommand(entry)) {
          throw Error("Could not load invalid Command");
        } else PluginHandler.#pluginData.commands[entry.name] = entry;
        if (key == "components" && !isComponent(entry)) {
          throw Error("Could not load invalid Component");
        } else PluginHandler.#pluginData.components[entry.name] = entry;
        entries++;
      }
    }
    console.log(
      "Loaded Plugin '" +
        plugin.$metadata.name +
        "' with " +
        entries +
        " Entries"
    );
  }

  static #sortPlugins(plugins) {
    if (plugins == undefined) return;
    return plugins.sort(function (a, b) {
      if (!isObject(a)) return -1;
      if (!isObject(b)) return 1;
      if (!hasOwn(a, "$metadata") || !hasOwn(a.$metadata, "priority")) return -1;
      if (!hasOwn(b, "$metadata") || !hasOwn(b.$metadata, "priority"))
        return 1;
      return a.$metadata.priority - b.$metadata.priority;
    });
  }

  static #validatePlugin(plugin) {
    if (
      !isObject(plugin) ||
      !isObject(plugin.$metadata) ||
      !(isObject(plugin.boards) || plugin.boards == undefined) ||
      !(isObject(plugin.commands) || plugin.commands == undefined) ||
      !(isObject(plugin.components) || plugin.components == undefined)
    ) {
      return false;
    }
    const m = plugin.$metadata;
    if (
      typeof m.id !== "string" ||
      typeof m.version !== "number" ||
      isNaN(m.version) ||
      !(typeof m.name == "string" || m.name == undefined) ||
      !(typeof m.description == "string" || m.description == undefined) ||
      !(typeof m.author == "string" || m.author == undefined) ||
      !(typeof m.license == "string" || m.license == undefined) ||
      !(
        (typeof m.priority == "number" && !isNaN(m.priority)) ||
        m.priority == undefined
      )
    ) {
      return false;
    }
    if (isObject(plugin.$dependicies)) {
      let d;
      for (const p of Object.keys(plugin.$dependicies)) {
        if (typeof p !== "string") return false;
        d = plugin.$dependicies[p];
        if (
          !(typeof d === "number" && isNaN(d)) ||
          !(typeof d === "string" && parseFloat(d) === NaN)
        ) {
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = { PluginHandler };
