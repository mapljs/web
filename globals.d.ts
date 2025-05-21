import * as c from './src/constants.js';

// Zero-cost constants at runtime
declare global {
  const constants: typeof c;
}
