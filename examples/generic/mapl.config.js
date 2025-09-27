import { minify } from "rollup-plugin-swc3";

/**
 * @type {import("@mapl/web/build/rolldown").MaplOptions}
 */
export const buildOptions = {
  build: {
    input: "./src/index.ts",
    output: {
      dir: "./build",
    },
  },
  hydrate: {
    plugins: [
      minify({
        module: true,
        mangle: false,

        compress: {
          passes: 3,
        },
      }),
    ],
  },
};
