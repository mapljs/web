import { compile, router } from '@mapl/web';
import * as st from 'safe-throw';

const app = router()
  .parse('token', (c) => {
    const header = c.req.headers.get('Authorization');
    if (typeof header === 'string' && /^Bearer ./.test(header))
      return header.slice(7);

    return st.err('Invalid token!');
  })
  .err((e, c) => {
    c.status = 403;
    return st.payload(e);
  })
  .get('/', (c) => c.token);

export default {
  fetch: compile(app)
};
