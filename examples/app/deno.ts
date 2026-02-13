import { build } from '@mapl/web/deno';
import { getDependency } from 'runtime-compiler';
import main from './src/main.ts';

Deno.serve(getDependency(build(main)));
