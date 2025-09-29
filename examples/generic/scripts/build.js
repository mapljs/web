// @ts-check
import build from '@mapl/web/build/rolldown';
import child_process from 'node:child_process';

import buildOptions from '../mapl.config.js';

await build(buildOptions);
child_process.fork('./server.js', {
  stdio: 'inherit',
});
