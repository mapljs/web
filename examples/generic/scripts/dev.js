// @ts-check
import { dev, watcherReady } from '@mapl/web/build/rolldown';
import buildOptions from '../mapl.config.js';
import child_process from 'node:child_process';

// Watch built output if necessary
const watcher = dev(buildOptions);
watcher && await watcherReady(watcher);

// node --watch server.js
child_process.fork('./server.js', {
  stdio: 'inherit',
  execArgv: ['--watch'],
});
