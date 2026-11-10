/**
 * Builds the npm package into dist/: the library, the command line, and the
 * type declarations. Everything it needs (the generator, the themes, marked)
 * is bundled in, so the published package has no dependencies.
 *
 * Run from the repository root: yarn build:cli
 */
import { build } from 'esbuild'
import { chmodSync, copyFileSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'))
const dist = join(here, 'dist')

rmSync(dist, { recursive: true, force: true })

await build({
  entryPoints: { index: join(here, 'src/index.ts'), cli: join(here, 'src/cli.ts') },
  outdir: dist,
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  chunkNames: 'shared-[hash]',
  define: { __VERSION__: JSON.stringify(version) },
  banner: { js: '#!/usr/bin/env node' },
  logLevel: 'warning',
})

// esbuild's banner goes on every output file; only the command line wants it
for (const file of readdirSync(dist).filter(name => name !== 'cli.js')) {
  const path = join(dist, file)
  writeFileSync(path, readFileSync(path, 'utf8').replace(/^#!.*\n/, ''))
}

copyFileSync(join(here, 'src/index.d.ts'), join(dist, 'index.d.ts'))
chmodSync(join(dist, 'cli.js'), 0o755)
console.log(`[ipsumify] built v${version} into packages/ipsumify/dist`)
