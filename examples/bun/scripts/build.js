// @ts-check
import { hydrate } from '@mapl/web/build/rolldown';
import child_process from 'node:child_process';
import buildOptions from '../mapl.config.js';

// Build and start the server
await hydrate(buildOptions);
child_process.fork('./server.js', {
  stdio: 'inherit',
});
