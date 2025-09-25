import terser from "@rollup/plugin-terser";

/**
 * @type {import("@mapl/web/build/rolldown").MaplAllOptions}
 */
export const buildOptions = {
  common: {
    input: "./src/index.ts",
    output: {
      dir: "./build",
    },
  },

  // Use terser for production build
  build: {
    finalizeOptions: {
      plugins: terser({
        compress: {
          passes: 3,
        },
        toplevel: true,
      }),
    },
  },
};
