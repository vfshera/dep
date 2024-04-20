import { type ServerQRL } from "@builder.io/qwik-city";

export type DeployScript<T = {}> = {
  id: string;
  name: string;
  description: string;
  handler: ServerQRL<
    (
      args: { WORKING_DIR: string } & T,
    ) => AsyncGenerator<ScriptYield, void, unknown>
  >;
};

export type ScriptYield = {
  type: "INFO" | "DATA" | "ERROR" | "WARN" | "END" | "START" | "SUCCESS";
  value: string;
};

export type LogOutput = {
  level: Lowercase<ScriptYield["type"]>;
  message: string;
  timestamp: string;
};
