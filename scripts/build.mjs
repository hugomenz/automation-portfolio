import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

try {
  await rm('dist', { recursive: true, force: true });
} catch (error) {
  if (error?.code !== 'EBUSY') throw error;
  for (const entry of await readdir('dist')) {
    await rm(`dist/${entry}`, { recursive: true, force: true });
  }
}
await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });
await writeFile('dist/404.html', await readFile('src/index.html'));
console.log('Built automation portfolio into dist');
