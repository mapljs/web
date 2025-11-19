import * as c from './src/constants.ts';

// Zero-cost constants at runtime
declare global {
  const constants: typeof c;
}
