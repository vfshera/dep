import path from "node:path";
import os from "node:os";

export function resolvePath(inputPath: string) {
  if (inputPath.startsWith("~/")) {
    return path.resolve(os.homedir(), inputPath.substring(2));
  } else {
    return path.resolve(inputPath);
  }
}
