import { defineConfig } from "tsup";

export default defineConfig((options) => {
    return {
        entry: ["src/extension.ts"],
        target: "es2022",
        outDir: "out",
        format: "cjs",
        clean: true,
        dts: true,
        sourcemap: !!options.watch,
        splitting: false,
        minify: !options.watch,
        bundle: true,
        treeshake: !options.watch,
        noExternal: options.watch ? undefined : [/^(?!vscode).*/],
        external: ["vscode"],
    };
});
