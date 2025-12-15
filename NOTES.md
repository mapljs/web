# AOT
Build entry point but exclude `runtime-compiler/config`.

## Build mode
- Replace `runtime-compiler/config` with `runtime-compiler/config/mode/build`.
- Run `compiler.buildToString` on exported app and get the content.

## Hydrate mode
- Replace `runtime-compiler/config` with `runtime-compiler/config/mode/hydrate`.
- Create hydration file with:
```ts
export default {
  fetch: (`${builtFn}`)(compiler.hydrate(app))()
};
```
- Use the file however u want.
