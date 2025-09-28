import terser from "@rollup/plugin-terser";

// @ts-check
/**
 * @type {import("@mapl/web/build/rolldown").MaplOptions}
 */
export default {
  main: "./src/index.ts",
  outputDir: "./build",

  hydrate: {
    plugins: [
      terser({
        module: true,
      }),
    ],
  },
};
