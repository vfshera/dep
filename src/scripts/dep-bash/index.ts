import { type DeployScript } from "~/types";
import * as u from "../utils";
import sh, { makeExecutable } from "~/lib/shell";
import { type RequestEvent, server$ } from "@builder.io/qwik-city";
import path from "path";
import { DEPLOY_SCRIPT_NAME } from "~/constants";

export default function (): DeployScript<{}> {
  return {
    id: "dep-bash-v1",
    name: "Dep",
    description: "Deploy with bash (dep.sh) from git!",
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

      const options: sh.SpawnOptionsWithoutStdio = {
        cwd: WORKING_DIR,
        shell: true,
      };

      yield u.start("Deploying Project...");

      const SCRIPT = path.join(WORKING_DIR, DEPLOY_SCRIPT_NAME);

      const { ok } = await makeExecutable(SCRIPT);

      if (ok) {
        const deploy = sh.spawn(`./${DEPLOY_SCRIPT_NAME}`, options);

        for await (const data of deploy.stdout) {
          yield u.data((data.toString() as string).trim());
        }

        for await (const data of deploy.stderr) {
          yield u.error((data.toString() as string).trim());
        }

        deploy.on("exit", (code) => {
          console.log(`[Deploy Script]: Exited with code ${code}`);
        });

        yield u.success("Deployment successfull!");

        yield u.end();
      } else {
        yield u.error("Could not make `./dep.sh` executable!");

        yield u.end();
      }
    }),
  };
}
