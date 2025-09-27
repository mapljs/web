import { minify } from "rollup-plugin-swc3";

/**
 * @type {import("@mapl/web/build/rolldown").MaplOptions}
 */
export const buildOptions = {
  main: "./src/index.ts",
  outputDir: "./build",
  hydrate: {
    plugins: [
      minify({
        module: true,
        mangle: false,

        compress: {
          passes: 4,
        },
      }),
    ],
  },
};
