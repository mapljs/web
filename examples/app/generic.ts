import { build } from '@mapl/web/generic';
import { getDependency } from 'runtime-compiler';
import main from './src/main.ts';

const fetch = getDependency(build(main));
console.log(fetch.toString());

export default {
  fetch,
};
