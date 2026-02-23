import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const currentNode = process.versions.node;
const currentMajor = Number(currentNode.split(".")[0]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const nvmrcPath = path.join(repoRoot, ".nvmrc");

let expectedMajor = 24;
try {
  const raw = readFileSync(nvmrcPath, "utf8").trim();
  const parsed = Number(raw.replace(/^v/i, "").split(".")[0]);
  if (Number.isFinite(parsed) && parsed > 0) {
    expectedMajor = parsed;
  }
} catch {
  // Keep default if .nvmrc is missing or unreadable.
}

if (currentMajor !== expectedMajor) {
  fail(
    [
      `Node ${expectedMajor}.x is required for this repo, but found Node ${currentNode}.`,
      "Run:",
      "  nvm install",
      "  nvm use",
      "",
      `Expected version is pinned in ${nvmrcPath}.`,
    ].join("\n"),
  );
}

const npmExecPath = process.env.npm_execpath ?? "";
const nodeRoot = path.dirname(path.dirname(process.execPath));
if (npmExecPath && !path.resolve(npmExecPath).startsWith(path.resolve(nodeRoot))) {
  fail(
    [
      "Detected mixed Node/npm toolchain paths.",
      `node: ${process.execPath}`,
      `npm : ${npmExecPath}`,
      "",
      `Both should come from the same runtime (Node ${expectedMajor}.x).`,
      "Fix by running `nvm use` and then retrying.",
    ].join("\n"),
  );
}
