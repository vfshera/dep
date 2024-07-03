import sh from "node:child_process";

import { promisify } from "node:util";

export const exec = promisify(sh.exec);

/**
 * Executes a shell command and returns the result.
 *
 * @param {string} command - The command to execute
 *
 */
export async function executeCommand(command: string): Promise<
  | {
      ok: true;
      stdout: string;
      stderr: string;
      error?: undefined;
    }
  | {
      ok: false;
      error: string;
      stdout?: undefined;
      stderr?: undefined;
    }
> {
  try {
    const { stdout, stderr } = await exec(command);

    return { ok: true, stdout, stderr };
  } catch (error) {
    let message = `Failed to execute '${command}' command.`;

    if (error instanceof Error) {
      message = error.message;
    }

    return { ok: false, error: message };
  }
}

/**
 * Executes the "touch" command on the specified path.
 *
 * @param {string} path - The path to create a new file at
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The result of creating the file
 */
export async function touch(path: string) {
  return executeCommand(`touch ${path}`);
}

/**
 * Generate a listing of the specified directory.
 *
 * @param {string} dir - The directory to list
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The result of listing the directory
 */
export async function ls(dir: string) {
  return executeCommand(`ls ${dir}`);
}

/**
 * Executes the 'cat' command on the specified file path.
 *
 * @param {string} path - The path of the file to be read
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The content of the file
 */
export async function cat(path: string) {
  return executeCommand(`cat ${path}`);
}

/**
 * Generate a new directory at the specified path.
 *
 * @param {string} path - The path where the new directory will be created
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The result of creating the directory
 */
export async function mkdir(path: string) {
  return executeCommand(`mkdir ${path}`);
}

/**
 * Change the current working directory to the specified directory.
 *
 * @param {string} dir - The directory to change to
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The result of changing the directory
 */
export async function cd(dir: string) {
  return executeCommand(`cd ${dir}`);
}

/**
 * Executes the "pwd" command asynchronously.
 *
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The current working directory path
 */
export async function pwd() {
  return executeCommand("pwd");
}

/**
 * Copies a file from one location to another.
 *
 * @param {string} from - The source file path
 * @param {string} to - The destination file path
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The result of copying the file
 */
export async function cp(from: string, to: string) {
  return executeCommand(`cp ${from} ${to}`);
}

/**
 * Removes a file or directory at the specified path.
 *
 * @param {string} path - The path of the file or directory to be removed
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The result of removing the file or directory
 */
export async function rm(path: string) {
  return executeCommand(`rm ${path}`);
}

/**
 * Move a file or directory from one location to another.
 *
 * @param {string} from - The source path
 * @param {string} to - The destination path
 * @return {Promise<{ ok: boolean, stdout?: string, error?: string }>} - The result of moving the file or directory
 */
export async function mv(from: string, to: string) {
  return executeCommand(`mv ${from} ${to}`);
}

/**
 * Checks if the specified file or directory exists in the haystack.
 *
 * @param {string|string[]} needle - The file or directory to look for
 * @param {string} haystack - The directory to search in
 * @return {Promise<{ ok: boolean, error?: string }>} - The result of the check
 */
export async function pathExists(needle: string | string[], haystack: string) {
  const { ok, stdout, error } = await executeCommand(`ls -a ${haystack}`);

  if (!ok) {
    return { ok: false, error };
  }

  const dirs = stdout.split("\n").filter(Boolean);

  const found = Array.isArray(needle)
    ? needle.some((dir) => dirs.includes(dir))
    : dirs.includes(needle);

  return { ok: found, error: found ? undefined : `Path not found: ${needle}` };
}

export default sh;
