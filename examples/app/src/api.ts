import { router, send, parser } from '@mapl/web';

import tokenParser from './parsers/token';

export default router.init(
  [tokenParser],
  [
    router.get(
      '/token',
      send.raw((token) => token, parser.result(tokenParser)),
    ),
  ],
);
