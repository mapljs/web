// @ts-check
import { dev, watch } from '@mapl/web/build/rolldown';
import buildOptions from '../mapl.config.js';
import child_process from 'node:child_process';

let proc;
const startDevServer = () =>
  (proc ??= child_process.fork('./server.js', {
    stdio: 'inherit',
    execArgv: ['--watch'],
  }));

if (buildOptions.build == null) {
  dev(buildOptions);
  startDevServer();
} else {
  // Watch the bundle when needed to
  watch(buildOptions).on('event', (e) => {
    if (e.code === 'BUNDLE_END') startDevServer();
  });
}
