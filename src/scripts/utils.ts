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

export function success(msg: string): ScriptYield {
  return { type: "SUCCESS", value: msg };
}

export function warn(msg: string): ScriptYield {
  return { type: "WARN", value: msg };
}

export function end(): ScriptYield {
  return { type: "END", value: "" };
}

export function start(msg: string): ScriptYield {
  return { type: "START", value: msg };
}
