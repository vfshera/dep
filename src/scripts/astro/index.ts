import { type DeployScript } from "~/types";
import sh from "~/lib/shell";
import { type RequestEvent, server$ } from "@builder.io/qwik-city";
import path from "path";

const BUILD_CMD = "npm run build";

export default function (): DeployScript<{}> {
  return {
    id: "astro",
    name: "Astro",
    description: "Deploy with Astro from git!",
    handler: server$(async function* (args) {
      // @ts-ignore
      const { env } = this as RequestEvent;

      const BASE_DIR = env.get("CMD_WORKING_DIR");

      if (!BASE_DIR) {
        throw Error(
          "Base directory not found! Please set `CMD_WORKING_DIR` in the .env file!",
        );
      }

      const WORKING_DIR = path.join(BASE_DIR, args.WORKING_DIR);

      yield { type: "START", value: "Deploying Astro Project..." };

      const build = sh.spawn(
        "npm",
        [
          "install",
          "&&",
          "echo",
          "'Building Project...'",
          "&&",
          ...BUILD_CMD.split(" "),
        ],
        {
          cwd: WORKING_DIR,
          shell: true,
        },
      );

      for await (const data of build.stdout) {
        yield { type: "DATA", value: (data.toString() as string).trim() };
      }

      for await (const data of build.stderr) {
        yield { type: "ERROR", value: (data.toString() as string).trim() };
      }

      build.on("exit", (code) => {
        console.log(`Child exited with code ${code}`);
      });

      yield { type: "END", value: "Done!" };
    }),
  };
}
