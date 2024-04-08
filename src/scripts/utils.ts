import { type ScriptYield } from "~/types";

export function info(msg: string): ScriptYield {
  return { type: "INFO", value: msg };
}

export function data(msg: string): ScriptYield {
  return { type: "DATA", value: msg };
}

export function error(msg: string): ScriptYield {
  return { type: "ERROR", value: msg };
}

export function warn(msg: string): ScriptYield {
  return { type: "WARN", value: msg };
}

export function end(msg: string): ScriptYield {
  return { type: "END", value: msg };
}

export function start(msg: string): ScriptYield {
  return { type: "START", value: msg };
}
