export { default as router } from './router';

import type { AnyRouter } from './router';
import genericCompile from './router/compiler';

export const compile: (app: AnyRouter) => (req: Request) => any = (app) => genericCompile(app, []);
