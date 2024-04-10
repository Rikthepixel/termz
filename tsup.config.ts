import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    entry: ["src/index.ts"],
    clean: true,
    dts: false,
    sourcemap: false,
    splitting: false,
    banner: {
      js: "#! /usr/bin/env node"
    },
    minify: !options.watch,
    outDir: "bin",
    format: "esm",
    bundle: !options.watch,
    noExternal: options.watch ? undefined : [/(.*)/],
  };
});
