import { type DeployScript } from "~/types";
import * as u from "../utils";
import sh from "~/lib/shell";
import { type RequestEvent, server$ } from "@builder.io/qwik-city";
import path from "path";
import { WORKING_DIR_KEY } from "~/constants";

export default function (): DeployScript<{
  branch?: string;
}> {
  return {
    id: "astro-dep-v1",
    name: "Astro",
    description: "Deploy with Astro from git!",
    handler: server$(async function* (args) {
      // @ts-ignore
      const { env } = this as RequestEvent;

      const branch = args.branch ?? "main";

      const BASE_DIR = env.get(WORKING_DIR_KEY);

      if (!BASE_DIR) {
        throw Error(
          `Base directory not found! Please set ${WORKING_DIR_KEY} in the .env file!`,
        );
      }

      const WORKING_DIR = path.join(BASE_DIR, args.WORKING_DIR);

      const options: sh.SpawnOptionsWithoutStdio = {
        cwd: WORKING_DIR,
        shell: true,
      };

      yield u.start("Deploying Astro Project...");

      /**
       *  git pull
       */
      yield u.info(`Getting latest changes from the '${branch}' branch`);

      const git = sh.spawn("git", ["pull", "origin", branch], options);

      for await (const data of git.stdout) {
        yield u.data((data.toString() as string).trim());
      }

      for await (const data of git.stderr) {
        yield u.error((data.toString() as string).trim());
      }

      git.on("exit", (code) => {
        console.log(`[git]: Child exited with code ${code}`);
      });

      /**
       *  npm install
       */
      yield u.info(`Installing Dependencies`);

      const install = sh.spawn("npm", ["install"], options);

      for await (const data of install.stdout) {
        yield u.data((data.toString() as string).trim());
      }

      for await (const data of install.stderr) {
        yield u.error((data.toString() as string).trim());
      }

      install.on("exit", (code) => {
        console.log(`[npm install]: Child exited with code ${code}`);
      });

      /**
       *  npm run build
       */
      yield u.info(`Building Project`);

      const build = sh.spawn("npm", ["run", "build"], options);

      for await (const data of build.stdout) {
        yield u.data((data.toString() as string).trim());
      }

      for await (const data of build.stderr) {
        yield u.error((data.toString() as string).trim());
      }

      build.on("exit", (code) => {
        console.log(`[npm build]:  Child exited with code ${code}`);
      });

      yield u.end( );
    }),
  };
}
