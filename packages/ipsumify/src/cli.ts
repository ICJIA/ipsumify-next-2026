import { run } from './run'

declare const __VERSION__: string

const result = run(process.argv.slice(2), __VERSION__)
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
process.exitCode = result.code
