import type { DotenvParseOutput } from "dotenv";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import {
  DEPLOY_ENV_FILE_NAME,
  PUBLIC_ENV_PREFIX,
  REDACTED_ENV_VALUE,
} from "~/constants";

/**
 * Loads environment variables from a specified file path.
 *
 * @param {string} depFolder - The path to projects .dep folder.
 * @return {Record<string, string>} An object containing the loaded environment variables.
 */
export function loadEnv(depFolder: string) {
  const envFilePath = path.join(depFolder, DEPLOY_ENV_FILE_NAME);

  if (fs.existsSync(envFilePath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envFilePath));

    return envConfig;
  } else {
    console.error(
      `${DEPLOY_ENV_FILE_NAME} file not found at path: ${envFilePath}`,
    );

    return null;
  }
}

export function redactEnvVariables(
  data: string,
  envConfig: DotenvParseOutput,
): string {
  for (const key in envConfig) {
    if (
      Object.prototype.hasOwnProperty.call(envConfig, key) &&
      !key.startsWith(PUBLIC_ENV_PREFIX)
    ) {
      const value = envConfig[key];

      data = data.replace(new RegExp(value, "g"), REDACTED_ENV_VALUE);
    }
  }

  return data;
}

export function detectUndefinedVariables(
  command: string,
  envConfig: DotenvParseOutput,
) {
  const undefinedVariables: string[] = [];

  const variableRegex = /\$([A-Za-z0-9_]+)/g;

  let match;

  while ((match = variableRegex.exec(command))) {
    const variableName = match[1];

    if (!(variableName in envConfig)) {
      undefinedVariables.push(variableName);
    }
  }

  return undefinedVariables.length ? undefinedVariables : null;
}
