import { router, handle } from '@mapl/web';

import * as bodyParser from '@mapl/stnl/body-parser';
import * as stringifier from '@mapl/stnl/stringifier';

import { payload } from '@safe-std/error';
import { t } from 'stnl';

export default handle.error(
  router(
    [
      bodyParser.json(
        'body',
        t.dict({
          name: t.string,
          pwd: t.string,
        }),
      ),
    ],
    [
      handle.post('/body', (c) => c.body, {
        type: stringifier.json(
          t.dict({
            name: t.string,
            pwd: t.string,
          }),
        ),
      }),
    ],
  ),
  (err) => payload(err),
  {
    type: handle.text,
  },
)
