Bun.$.cwd(import.meta.dir);

const entries = ['mapl.ts', 'web.ts'];

console.log('Bun:');
await Promise.all(entries.map((entry) => Bun.$`bun ${entry}`));

console.log('---');

console.log('Node:');
await Promise.all(entries.map((entry) => Bun.$`bun tsx ${entry}`));
