# Dep

Designed to simplify the process of deploying CPANEL sites.

## How It Works

Dep searches for a `.dep` directory in the root of your project. Within this directory, it looks for a `deploy.yaml` or `deploy.yml` file, which must match the following Zod schema:

```ts
const runJobSchema = z.object({
  name: z.string(),
  run: z.string(),
});

export const workflowSchema = z.object({
  name: z.string(),
  jobs: z.record(
    z.string(),
    z.union([
      runJobSchema,
      z.object({
        name: z.string(),
        steps: z.array(runJobSchema),
      }),
    ]),
  ),
});
```

## Example Configuration

Your `deploy.yaml` or `deploy.yml` file should look something like this:

```yaml
name: Astro Blog
jobs:
  pull:
    name: Pull Latest Changes
    run: git pull
  install:
    name: Install Dependencies
    run: pnpm install
  build:
    name: Build Project
    run: pnpm run build
```

## Environment Variable Support

Load variables into scripts by declaring a .env.dep file. The output will NOT be redacted in logs and ui if the env key starts with `PUBLIC_`

```yaml
name: Demo
jobs:
  list:
    name: Echo
    run: echo $S3_BUCKET
```
