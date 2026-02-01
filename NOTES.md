# AOT
Build entry point but exclude `runtime-compiler`.

## Build mode
- Replace `runtime-compiler/config` with `runtime-compiler/config/mode/build`.
- Run `compiler.buildToString` on exported app and get the content.

## Hydrate mode
- Replace `runtime-compiler/config` with `runtime-compiler/config/mode/hydrate`.
- Create hydration file with:
```ts
// app.ts
export default compile.build(app);

// hydrate.ts
import id from './app.ts';
import getDependency from 'runtime-compiler';

export default {
  fetch: getDependency(id)
};
```
- Use the file however u want.
