import sh from "node:child_process";

import {promisify}from "node:util"

export const exec = promisify(sh.exec);

/**
 * Executes the "touch" command on the specified path.
 *
 * @param {string} path - the path to create a new file at
 * @return {Promise<void>} a Promise that resolves after creating the file
 */
export async function touch(path: string) {
    return exec(`touch ${path}`);
}

/**
 * Generate a listing of the specified directory.
 *
 * @param {string} dir - the directory to list
 * @return {Promise<string>} the result of listing the directory
 */
export async function ls(dir: string) {
    return exec(`ls ${dir}`);
}

/**
 * Executes the 'cat' command on the specified file path.
 *
 * @param {string} path - the path of the file to be read
 * @return {Promise<string>} a promise that resolves with the content of the file
 */
export async function cat(path: string) {
    return exec(`cat ${path}`);
}

/**
 * Generate a new directory at the specified path.
 *
 * @param {string} path - the path where the new directory will be created
 * @return {Promise<void>} a Promise that resolves after creating the directory
 */
export async function mkdir(path: string) {
    return exec(`mkdir ${path}`);
}
 
/**
 * Change the current working directory to the specified directory.
 *
 * @param {string} dir - the directory to change to
 * @return {Promise<void>} a promise that resolves when the directory change is complete
 */
export async function cd(dir: string) {
    return exec(`cd ${dir}`);
}

/**
 * Executes the "pwd" command asynchronously.
 *
 * @return {Promise<string>} The current working directory path.
 */
export async function pwd() {
    return exec("pwd");
}

/**
 * Copies a file from one location to another.
 *
 * @param {string} from - the source file path
 * @param {string} to - the destination file path
 * @return {Promise<void>} a Promise that resolves when the file is successfully copied
 */
export async function cp(from: string, to: string) {
    return exec(`cp ${from} ${to}`);
}

/**
 * Removes a file or directory at the specified path.
 *
 * @param {string} path - the path of the file or directory to be removed
 * @return {Promise<void>} a promise that resolves after the file or directory is removed
 */
export async function rm(path: string) {
    return exec(`rm ${path}`);
}

/**
 * Move a file or directory from one location to another.
 *
 * @param {string} from - the source path
 * @param {string} to - the destination path
 * @return {Promise<string>} - a promise that resolves with the output of the `mv` command
 */
export async function mv(from: string, to: string) {
    return exec(`mv ${from} ${to}`);
}

export async function exists(needle:string|string[],haystack:string){
    const res = await exec(`ls -a ${haystack}`);

 const dirs =res.stdout.split("\n") .filter(Boolean)
 
 
    
    if (res.stderr !== "") {
      
        return {ok:false,error:res.stderr}
    }

    if (typeof needle === "string" &&!dirs.includes(needle)) {
     return {ok:false}
    }

    if (Array.isArray(needle) && !needle.some((dir) => dirs.includes(dir))) {
        return {ok:false}
    }

    return {ok:true}
 }



export async function makeExecutable(file:string){
    try {
        await exec(`chmod +x ${file}`);
        return{ok: true};
    } catch (error) {
        console.error("Error making script executable:", error);
        return {ok:false};
    }
}
 
export default sh

