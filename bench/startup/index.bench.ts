Bun.$.cwd(import.meta.dir);

const entries = ['mapl.ts', 'web.ts'];

console.log('Bun:');
for (const entry of entries)
  await Bun.$`bun ${entry}`;
console.log('---');

console.log('Node:');
for (const entry of entries)
  await Bun.$`bun ${entry}`;
