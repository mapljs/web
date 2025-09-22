import app from './main.js';
import { compileToHandlerSync } from '../../lib/compiler/bun/jit.js';

Bun.serve({
  routes: compileToHandlerSync(app),
});
