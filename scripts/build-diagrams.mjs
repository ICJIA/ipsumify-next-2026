/**
 * Renders the Mermaid sources in diagrams/ to the SVGs in public/diagrams/
 * that the technical details page shows.
 *
 * The SVGs are committed, so a normal build needs neither Mermaid nor a
 * browser. Run this only after editing a .mmd file: yarn build:diagrams
 *
 * Mermaid's command line drives a browser. Set CHROME_PATH to use one that is
 * already installed; otherwise it downloads its own.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'

const SOURCES = 'diagrams'
const OUTPUT = 'public/diagrams'
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const chrome = process.env.CHROME_PATH ?? (existsSync(MAC_CHROME) ? MAC_CHROME : undefined)

const extra = []
const env = { ...process.env }
if (chrome) {
  const config = join(mkdtempSync(join(tmpdir(), 'ipsumify-diagrams-')), 'puppeteer.json')
  writeFileSync(config, JSON.stringify({ executablePath: chrome }))
  extra.push('-p', config)
  env.PUPPETEER_SKIP_DOWNLOAD = '1'
}

for (const file of readdirSync(SOURCES).filter(name => name.endsWith('.mmd'))) {
  const out = join(OUTPUT, `${basename(file, '.mmd')}.svg`)
  execFileSync('npx', [
    '-y', '@mermaid-js/mermaid-cli@11',
    '-i', join(SOURCES, file),
    '-o', out,
    '-c', join(SOURCES, 'mermaid.config.json'),
    '-b', 'transparent',
    ...extra,
  ], { stdio: 'inherit', env })
  console.log(`[diagrams] ${file} -> ${out}`)
}
