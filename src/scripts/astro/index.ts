import { type DeployScript } from "~/types";
import * as u from "../utils";
import sh from "~/lib/shell";
import { type RequestEvent, server$ } from "@builder.io/qwik-city";
import path from "path";

export default function (): DeployScript<{ branch?: string }> {
  return {
    id: "astro",
    name: "Astro",
    description: "Deploy with Astro from git!",
    handler: server$(async function* (args) {
      // @ts-ignore
      const { env } = this as RequestEvent;
      const branch = args.branch ?? "main";

      const BASE_DIR = env.get("CMD_WORKING_DIR");

      if (!BASE_DIR) {
        throw Error(
          "Base directory not found! Please set `CMD_WORKING_DIR` in the .env file!",
        );
      }

      const WORKING_DIR = path.join(BASE_DIR, args.WORKING_DIR);

      yield u.start("Deploying Astro Project...");

      /**
       *  git pull
       */
      yield u.info(`Getting latest changes from ${branch} branch..`);

      const git = sh.spawn("git", ["pull", "origin", branch], {
        cwd: WORKING_DIR,
        shell: true,
      });

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
      yield u.info(`Installing Dependencies:`);

      const install = sh.spawn("npm", ["install"], {
        cwd: WORKING_DIR,
        shell: true,
      });

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
      yield u.info(`Building Astro Project:`);

      const build = sh.spawn("npm", ["run", "build"], {
        cwd: WORKING_DIR,
        shell: true,
      });

      for await (const data of build.stdout) {
        yield u.data((data.toString() as string).trim());
      }

      for await (const data of build.stderr) {
        yield u.error((data.toString() as string).trim());
      }

      build.on("exit", (code) => {
        console.log(`[npm build]:  Child exited with code ${code}`);
      });

      yield u.end("Done!");
    }),
  };
}
