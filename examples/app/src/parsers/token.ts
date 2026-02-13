import { send, parser } from '@mapl/web';
import { request } from '@mapl/web/generic';
import { err } from '@safe-std/error';

const validTokens = [
  'tRz8WHCGRXJSjMWq6N3riFEmWZpA+gb/hM/9xa40X1Q=',
  '4cYxCSZPxF6k3v1cxsjsmQLJl5pxGgzVX4PsPfJLF1c=',
  'oxnCI3IW4ZLjj5yhMEy1qTAcToySHix0002xbC6SSA0=',
  'GThxHUey7Z5X60huDAXHI4ZCXSsOhW/mV80Q44EBdWo=',
  'UMeKBbXA1Uk7UE4h3toSnMvmpL353VYE7haEuUNodBI=',
];

export default parser.onError(
  parser.init((req, res) => {
    const bearer = req.headers.get('Authorization');
    if (bearer?.startsWith('Bearer ')) {
      const token = bearer.slice(7);
      if (validTokens.includes(token)) return token;

      res.status = 403;
      return err('Invalid token: ' + token);
    }

    res.status = 401;
    return err('A token is required to access this resource');
  }, request),

  // Send back the error message
  send.raw((e) => e.payload),
);
