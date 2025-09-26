`@mapl/web` example server.
- `scripts/`: Build scripts.
  - `dev.js`: Start development server.
  - `build.js`: Start production server.
- `server/`: Utilities to start the server.
  - `index.js`: Server process manager.
  - `main.js`: Start the server.
- `src/`: Main application.
  - `index.ts`: Server entry point. Configurable in `mapl.config.js`.
- `mapl.config.js`: Mapl build config.

```sh
# Install build dependencies
npm i @mapl/web rolldown @rollup/plugin-terser

# Run server on Node
npm i winter-compat

# Request validator and response serializer
npm i @mapl/stnl stnl

# Start development server
node scripts/dev.js

# Start production server
node scripts/build.js
```
