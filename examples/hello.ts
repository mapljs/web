import { compile, router } from '@mapl/web';

export default {
  fetch: compile(
    router().get('/', (c) => {
      c.status = 200;
      c.statusText = 'Hi';
      return 'Hi'
    })
  )
}
