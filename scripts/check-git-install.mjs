#!/usr/bin/env node
// Installs the current commit the way the docs tell people to, from git rather than from this
// checkout, with both a global install and npx, and checks the installed command runs.
// Uncommitted changes aren't covered. Needs network access to fetch dependencies from npm.
//
// The global install runs npm 12 because `npm install -g` from git is broken in npm 11 and older:
// its nested install for the build inherits the global flag, so it has no devDependencies, and
// when it does succeed it replaces the outer install's folder with a link to a temporary clone.
import { execFileSync } from "node:child_process";
import { lstatSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = realpathSync(mkdtempSync(join(tmpdir(), "pearwrite-install-")));
const repo = join(root, "repo");
const branch = "install-check";

// npm run sets npm_config_* for its children; a person's shell wouldn't have them.
const env = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.toLowerCase().startsWith("npm_")),
);

function run(command, args, cwd = root) {
  console.log(`$ ${command} ${args.join(" ")}`);
  return execFileSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    shell: process.platform === "win32",
  });
}

function assertGuide(output, route) {
  if (!output.includes("Pearwrite")) {
    throw new Error(`${route}: \`pearwrite guide\` did not print the guide:\n${output}`);
  }
  console.log(`ok: ${route}`);
}

try {
  run("git", ["clone", "--quiet", "--no-hardlinks", process.cwd(), repo]);
  run("git", ["checkout", "--quiet", "-B", branch], repo);
  const url = `git+file://${repo}#${branch}`;

  const prefix = join(root, "prefix");
  const cache = join(root, "cache-global");
  run("npx", ["-y", "--cache", cache, "npm@12", "install", "-g", "--allow-git=all", url, "--prefix", prefix, "--cache", cache]);
  if (lstatSync(join(prefix, "lib", "node_modules", "pearwrite")).isSymbolicLink()) {
    throw new Error("global install: the package is a link to a temporary clone, not a real folder");
  }
  // npm's temporary clones are gone, as they would be for anyone using the install later.
  rmSync(cache, { recursive: true, force: true });
  assertGuide(run(join(prefix, "bin", "pearwrite"), ["guide"]), "global install");

  assertGuide(
    run("npx", ["-y", "--allow-git=all", "--cache", join(root, "cache-npx"), url, "guide"]),
    "npx",
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
