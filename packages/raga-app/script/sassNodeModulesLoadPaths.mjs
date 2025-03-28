/*
 * @fileoverview Small bit of config for Sass compiler module resolution.
 * Ported from @blueprintjs/node-build-scripts/src/sass/sassNodeModulesLoadPaths.mjs
 */

import { dirname, join, resolve } from "node:path";
import { cwd } from "node:process";

import { packageUpSync } from "package-up";

const packageJsonPath = packageUpSync({ cwd: cwd() });
if (packageJsonPath === undefined) {
  throw new Error(
    `[node-build-scripts] Unable to generate Sass loadPaths, make sure there is a package.json file and node_modules directory`,
  );
}

const nodeModulesDirectory = resolve(join(dirname(packageJsonPath), "node_modules"));
const maybeMonorepoPackageJsonPath = packageUpSync({ cwd: resolve(join(cwd(), "..")) });

/**
 * Path to preferred node_modules folder to load Sass file imports from.
 *
 * @type {string[]}
 */
export const loadPaths = [nodeModulesDirectory];

if (maybeMonorepoPackageJsonPath !== undefined) {
  loadPaths.unshift(join(dirname(maybeMonorepoPackageJsonPath), "node_modules"));
}
