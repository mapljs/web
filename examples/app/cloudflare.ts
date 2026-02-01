import { build } from '@mapl/web/cloudflare';
import { getDependency } from 'runtime-compiler';
import main from './main.ts';

export default {
  fetch: getDependency(build(main)),
};
