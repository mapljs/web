// @ts-check
import terser from "@rollup/plugin-terser";

/**
 * @type {import("@mapl/web_dev/build/rolldown").MaplAllOptions}
 */
export const buildOptions = {
  common: {
    input: "./src/index.ts",
    output: {
      dir: "./build",
    },
    target: "bun",
  },

  // Use terser for production build
  build: {
    finalizeOptions: {
      plugins: terser({
        compress: {
          passes: 3,
        },
        mangle: false,
      }),
    },
  },
};
