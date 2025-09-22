import app from './main.js';
import { compileToHandlerSync } from '../../lib/compiler/bun/jit.js';

export default {
  fetch: compileToHandlerSync(app),
};
