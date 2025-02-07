"use strict";

import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import screeps from 'rollup-plugin-screeps';
import { readFileSync,writeFileSync } from 'fs';

let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log("No destination specified - code will be compiled but not uploaded");
} else if ((cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}
/**@type {() => import("rollup").Plugin} */
function sourcemapToJs() {
  return {
    writeBundle(options) {
      if (options.sourcemap && options.file) {
        const str = readFileSync(`${options.file}.map`, {
          encoding: "utf-8",
        });
        writeFileSync(`${options.file}.map`, `module.exports = ${str}`);
      }
    },
  };
}

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve({ rootDir: "src" }),
    commonjs(),
    typescript({tsconfig: "./tsconfig.json"}),
    sourcemapToJs(),
    screeps({config: cfg, dryRun: cfg == null})
  ]
}
