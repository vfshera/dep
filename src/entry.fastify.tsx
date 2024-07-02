/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Fastify server when building for production.
 *
 * Learn more about Node.js server integrations here:
 * - https://qwik.dev/docs/deployments/node/
 *
 */
import { type PlatformNode } from "@builder.io/qwik-city/middleware/node";
import "dotenv/config";
import Fastify from "fastify";
import type { FastifyServerOptions } from "fastify";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import FastifyQwik from "./plugins/fastify-qwik";

declare global {
  interface QwikCityPlatform extends PlatformNode {}
}

// Directories where the static assets are located
const distDir = join(fileURLToPath(import.meta.url), "..", "..", "dist");

const buildDir = join(distDir, "build");

// Allow for dynamic port and host
const PORT = parseInt(process.env.PORT ?? "3000");

const HOST = process.env.HOST ?? "0.0.0.0";

const fastifyOptions: FastifyServerOptions = {};

if (process.stdout.isTTY) {
  fastifyOptions.logger = {
    level: "debug",
    transport: {
      target: "@fastify/one-line-logger",
    },
  };
} else {
  fastifyOptions.logger = {
    level: "warn",
    transport: {
      target: "pino-roll",
      options: { frequency: "daily", mkdir: true, size: "10m" },
    },
  };
}

const start = async () => {
  // Create the fastify server
  const fastify = Fastify(fastifyOptions);

  // Enable compression
  await fastify.register(import("@fastify/compress"));

  // Handle Qwik City using a plugin
  await fastify.register(FastifyQwik, { distDir, buildDir });

  // Start the fastify server
  await fastify.listen({ port: PORT, host: HOST });
};

start();
