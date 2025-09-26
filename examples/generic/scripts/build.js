// @ts-check
import build from '@mapl/web/build/rolldown';

import { restartServer } from '../server/index.js';
import { buildOptions } from '../mapl.config.js';

build({
  ...buildOptions.common,
  ...buildOptions.build,
}).then(restartServer);
