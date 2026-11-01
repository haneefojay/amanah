/**
 * Generates TypeScript types from the backend's OpenAPI contract (haneefojay/amanah-api).
 *
 *   npm run api:types                       # reads ../amanah-api/openapi.json
 *   API_SPEC=/path/or/url npm run api:types # any file path or http(s) URL
 *
 * Copies the spec to src/lib/api/openapi.json (so the generated types are reproducible from this
 * repository alone) and writes src/lib/api/generated.ts. Commit both.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = process.env.API_SPEC ?? resolve(root, "..", "amanah-api", "openapi.json");
const specPath = resolve(root, "src/lib/api/openapi.json");
const typesPath = resolve(root, "src/lib/api/generated.ts");

mkdirSync(dirname(specPath), { recursive: true });
if (/^https?:\/\//.test(source)) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not fetch ${source}: ${response.status}`);
  writeFileSync(specPath, await response.text());
} else {
  copyFileSync(source, specPath);
}

const run = spawnSync(
  process.execPath,
  [resolve(root, "node_modules/openapi-typescript/bin/cli.js"), specPath, "-o", typesPath],
  { stdio: "inherit" },
);
if (run.status !== 0) process.exit(run.status ?? 1);
