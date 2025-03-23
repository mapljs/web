Bun.$.cwd(import.meta.dir);

const entries = ['mapl.ts', 'web.ts'];

console.log('Bun:');
for (const entry of entries) {
  console.log(entry);
  await Bun.$`bun ${entry}`;
  console.log();
}

console.log('---');

console.log('Node:');
for (const entry of entries) {
  console.log(entry);
  await Bun.$`bun tsx ${entry}`;
  console.log();
}
