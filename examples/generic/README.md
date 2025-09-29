`@mapl/web` example server.
- `scripts/`: Build scripts.
  - `dev.js`: Start development server.
  - `build.js`: Start production server.
- `server.js`: Server launcher.
- `src/`: Main application.
  - `index.ts`: Server entry point. Configurable in `mapl.config.js`.
- `mapl.config.js`: Mapl build config.

```sh
# Install build dependencies
npm i @mapl/web rolldown

# Install minifier plugin for rolldown
npm i @rollup/plugin-terser

# Run server on Node (optional)
npm i srvx

# Request validator and response serializer (optional)
npm i @mapl/stnl stnl

# Start development server
node scripts/dev.js

# Start production server
node scripts/build.js
```
