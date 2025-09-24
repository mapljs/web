import app from './main.js';
import { compileToHandlerSync } from '../lib/compiler/jit.js';

export default {
  fetch: compileToHandlerSync(app),
};
