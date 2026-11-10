/**
 * Writes the page's Content-Security-Policy into dist/_headers after a build.
 *
 * The prerendered page carries a few inline scripts (the import map, the
 * color-mode bootstrap, and Nuxt's runtime config, which embeds the build id
 * and so changes on every build). Allowing them by hash, computed here from
 * the HTML that was just built, is what lets the policy drop 'unsafe-inline'
 * for scripts: an injected inline script has no matching hash and is refused.
 *
 * The policy lives here and not in netlify.toml because it depends on the
 * build output. Two policies would both be enforced, so keep it in one place.
 *
 * It also checks that every script and stylesheet the page references was
 * actually written by this build.
 *
 * Runs as part of `yarn build`. Does nothing for a build that has no dist/
 * (for example NITRO_PRESET=node-server), and fails the build if dist/ exists
 * but the page has no inline scripts to hash, since that means the page shape
 * changed and the policy needs a second look.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const PAGE = 'dist/index.html'
const HEADERS = 'dist/_headers'

if (!existsSync(PAGE)) {
  console.log(`[csp] ${PAGE} not found; skipping (not a Netlify build).`)
  process.exit(0)
}

const html = readFileSync(PAGE, 'utf8')

// A page that points at files the build did not write loads as a blank
// screen. It happens when a stale build directory is reused; fail here, not
// in production.
const missing = [...new Set(html.match(/\/_nuxt\/[\w.-]+\.(?:js|css)/g) ?? [])]
  .filter(asset => !existsSync(`dist${asset}`))
if (missing.length > 0) {
  console.error(`[csp] ${PAGE} references ${missing.length} files missing from dist/ (e.g. ${missing[0]}). Delete .nuxt and dist, then rebuild.`)
  process.exit(1)
}
const hashes = new Set()
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  const [, attrs, body] = match
  if (/\bsrc\s*=/.test(attrs) || body.length === 0) continue
  hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`)
}

if (hashes.size === 0) {
  console.error(`[csp] No inline scripts found in ${PAGE}; refusing to write a policy.`)
  process.exit(1)
}

const policy = [
  `default-src 'self'`,
  `script-src 'self' ${[...hashes].join(' ')}`,
  // Vue and the UI library set element styles at runtime
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data:`,
  `font-src 'self' data:`,
  `connect-src 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join('; ')

// Replace a policy written by an earlier run on the same dist/, so the file
// never holds two (a browser enforces every policy it is sent)
const existing = existsSync(HEADERS) ? readFileSync(HEADERS, 'utf8') : ''
const withoutPolicy = existing.replace(/^\/\*\n {2}Content-Security-Policy: .*\n/gm, '')
writeFileSync(HEADERS, `${withoutPolicy}/*\n  Content-Security-Policy: ${policy}\n`)
console.log(`[csp] Wrote policy with ${hashes.size} script hashes to ${HEADERS}.`)
