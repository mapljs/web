import { router, send, parser, cors, layer } from '@mapl/web';

import tokenParser from './parsers/token';

export default router.init(
  [
    tokenParser,
    cors.allowOrigins('http://localhost', 'https://example.com'),
    layer.appendHeaders(cors.allowCredentials),
  ],
  [
    // Handle preflight requests for all child routes
    router.options(
      '/**',
      layer.appendHeaders(cors.allowMethods('GET', 'POST')),
      send.withoutContent,
    ),
    router.get(
      '/token',
      send.raw((token) => token, parser.result(tokenParser)),
    ),
  ],
);
