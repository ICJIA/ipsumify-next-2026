#!/usr/bin/env bash
set -euo pipefail

# ipsumify publish script: puts a release's npm package on npm, from your machine.
#
# Usage:
#   ./publish.sh             publish packages/ipsumify/package.json's version of ipsumify to npm
#   ./publish.sh --dry-run   run every check and a dry-run publish; change nothing, ask for no
#                            code (if you're not logged in to npm, it warns instead of logging in)
#   ./publish.sh --help      print this
#
# A release comes first, and this script never makes one: bump the version in package.json,
# ipsumify.config.ts and packages/ipsumify/package.json together, add the CHANGELOG.md section,
# push main, and push the tag (vX.Y.Z). CI lints, tests and builds that commit. Then, from main:
# ./publish.sh --dry-run, then ./publish.sh. There is no version argument and no bump: the version
# is the release's. A publish asks for npm's approval last, just before it publishes: a link to
# open in a browser on any device, or npm's code on some accounts.
#
# Not every release needs publishing: one that changes only the website can skip npm, and the
# next publish simply carries the then-current version.
#
# Works in Git Bash on Windows as well as on macOS and Linux.
#
# Before anything is published, it checks that:
#   - you're in the Ipsumify repository's root, on main (or at the release's tag), up to date with
#     origin/main, with a clean tree, and logged in to npm and to the GitHub CLI;
#   - the release exists: the tag v<version> is on this branch, CHANGELOG.md has its section, and
#     the CI workflow passed for the tag's commit; and ipsumify@<version> isn't on npm yet;
#   - the tag's own commit (in a temporary worktree, so nothing later on main leaks in) installs,
#     builds the package, and passes the unit tests;
#   - the package holds package.json, README.md, LICENSE, and dist/'s command line, library, types
#     and shared chunk and nothing else, with no dependencies or scripts, and the packed tarball
#     installs, prints its version, generates the expected text for a known seed, and refuses a
#     bad theme.
# It then shows the commits in the release, asks for the version to be typed, and then for npm's
# approval. What it publishes is the tarball it installed and ran. It never commits, tags,
# or pushes: the release did those.

PACKAGE_NAME="ipsumify"
BRANCH="main"
PACKAGE_DIR="packages/ipsumify"
MANIFEST="$PACKAGE_DIR/package.json"
WORKFLOW="ci.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
info() { echo -e "${GREEN}[ipsumify]${NC} $1"; }
warn() { echo -e "${YELLOW}[ipsumify]${NC} $1"; }
error() { echo -e "${RED}[ipsumify]${NC} $1" >&2; }
die() {
  error "$1"
  exit 1
}

# The usage: the comment at the top of this file, from "Usage:" to the first blank comment line.
usage() {
  awk '/^# Usage:/ { on = 1 } on && /^#$/ { exit } on { sub(/^# ?/, ""); print }' "$0"
}

# ─── Arguments ──────────────────────────────────────────────────────

DRY_RUN=false
if [[ $# -gt 1 ]]; then
  usage
  die "publish.sh takes one argument at most (--dry-run or --help). The version is the release's."
fi
case "${1:-}" in
  "") ;;
  --dry-run) DRY_RUN=true ;;
  --help | -h)
    usage
    exit 0
    ;;
  *)
    usage
    die "Unknown argument '$1'. There is no version argument: the version is the release's."
    ;;
esac

# A problem that stops a publish, and that a dry run only warns about (so it can show the rest).
problem() {
  if [[ "$DRY_RUN" == true ]]; then
    warn "$1 A publish would stop here."
  else
    die "$1"
  fi
}

# Read a field of a package.json with Node (CommonJS, whatever the package's type).
json_field() {
  node --input-type=commonjs -e "console.log(require(require('path').resolve(process.argv[1])).$2)" "$1"
}

# ─── Clean up on the way out ────────────────────────────────────────

WORK=""
WORKTREE=""
cleanup() {
  if [[ -n "$WORKTREE" ]]; then
    git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
    git worktree prune >/dev/null 2>&1 || true
  fi
  [[ -z "$WORK" ]] || rm -rf "$WORK"
}
trap cleanup EXIT

# ─── Preflight ──────────────────────────────────────────────────────

[[ -f ipsumify.config.ts && -f "$MANIFEST" ]] ||
  die "No ipsumify.config.ts or $MANIFEST here. Run this from the Ipsumify repository's root."
for tool in git node yarn npm gh; do
  command -v "$tool" >/dev/null || die "$tool is required."
done
[[ "$(json_field "$MANIFEST" name)" == "$PACKAGE_NAME" ]] || die "$MANIFEST isn't $PACKAGE_NAME."
gh auth status >/dev/null 2>&1 || die "The GitHub CLI isn't logged in (gh auth login)."

VERSION=$(json_field "$MANIFEST" version)
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]] || die "$MANIFEST has no usable version ('$VERSION')."
[[ "$(json_field package.json version)" == "$VERSION" ]] ||
  die "package.json ($(json_field package.json version)) and $MANIFEST ($VERSION) disagree on the version."
TAG="v$VERSION"
info "Version: $VERSION (tag $TAG)"

if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  die "Uncommitted changes. Commit or stash them first."
fi

info "Fetching origin/$BRANCH and the tags..."
git fetch --quiet origin "$BRANCH" --tags
HEAD_COMMIT=$(git rev-parse HEAD)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
AT_TAG=false
[[ "$(git describe --tags --exact-match HEAD 2>/dev/null || true)" == "$TAG" ]] && AT_TAG=true
if [[ "$CURRENT_BRANCH" != "$BRANCH" && "$AT_TAG" == false ]]; then
  problem "Publish from $BRANCH or from the tag $TAG (you're on $CURRENT_BRANCH)."
fi
if [[ "$HEAD_COMMIT" != "$(git rev-parse "origin/$BRANCH")" && "$AT_TAG" == false ]]; then
  problem "$BRANCH and origin/$BRANCH differ, and HEAD isn't the tag $TAG. Pull first."
fi

if npm whoami >/dev/null 2>&1; then
  info "npm user: $(npm whoami)"
elif [[ "$DRY_RUN" == true ]]; then
  # Logging in writes a token to ~/.npmrc, and a dry run changes nothing.
  warn "Not logged in to npm. The dry run continues; a real publish will ask you to log in."
else
  warn "Not logged in to npm. Logging in now..."
  npm login
  info "npm user: $(npm whoami)"
fi

# ─── The release must exist first ───────────────────────────────────

if npm view "$PACKAGE_NAME@$VERSION" version >/dev/null 2>&1; then
  die "$PACKAGE_NAME@$VERSION is already on npm."
fi
FIRST_TIME=false
if ! npm view "$PACKAGE_NAME" version >/dev/null 2>&1; then
  FIRST_TIME=true
  warn "$PACKAGE_NAME isn't on npm yet: this is its first publish."
fi

TAG_COMMIT=""
if TAG_COMMIT=$(git rev-parse -q --verify "refs/tags/$TAG^{commit}"); then
  git merge-base --is-ancestor "$TAG_COMMIT" HEAD ||
    problem "The tag $TAG ($TAG_COMMIT) isn't on this branch."
  info "The tag $TAG marks $TAG_COMMIT."
else
  TAG_COMMIT=""
  problem "There's no tag $TAG. Make the release first (bump, push, push the tag)."
fi

# A fixed string, so the dots in the version are dots (^ isn't needed: "## [" starts a section).
if grep -qF "## [$VERSION]" CHANGELOG.md; then
  info "CHANGELOG.md has a section for $VERSION."
else
  problem "CHANGELOG.md has no '## [$VERSION]' section."
fi

# CI runs on pushes to main, not on tags, so the run that counts is the push run for the tag's
# own commit, and only when it finished and passed.
CI=""
if [[ -n "$TAG_COMMIT" ]]; then
  CI=$(gh run list --workflow "$WORKFLOW" --branch "$BRANCH" --event push --commit "$TAG_COMMIT" --limit 5 \
    --json status,conclusion,headSha \
    --jq "[.[] | select(.headSha == \"$TAG_COMMIT\")][0] | \"\\(.status) \\(.conclusion)\"" 2>/dev/null || true)
fi
case "$CI" in
  "completed success") info "The $WORKFLOW run for $TAG's commit passed." ;;
  "" | "null null") problem "No $WORKFLOW run found for $TAG's commit." ;;
  *) problem "The $WORKFLOW run for $TAG's commit hasn't passed (${CI% })." ;;
esac

# ─── Build and check, at the tag's commit ───────────────────────────

WORK=$(mktemp -d)
WORKTREE="$WORK/source"
if [[ -n "$TAG_COMMIT" ]]; then
  BUILD_AT="$TAG"
else
  # Only a dry run gets here without a tag: it builds this commit instead, to show the rest.
  BUILD_AT="$HEAD_COMMIT"
  warn "Building this commit instead of the tag, for the dry run."
fi
info "Checking out $BUILD_AT in a temporary worktree..."
# Line endings exactly as committed (LF), whatever this machine's Git says.
git -c core.autocrlf=false -c core.eol=lf worktree add --quiet --detach "$WORKTREE" "$BUILD_AT"
(
  cd "$WORKTREE"
  # No dependency's install script runs. The one script that is needed is the repository's own
  # postinstall, run here by name: it writes .nuxt/tsconfig.json, which the tests' compiler reads.
  yarn install --frozen-lockfile --ignore-scripts --silent
  yarn --silent nuxt prepare
  yarn --silent build:cli
  yarn --silent test:unit
) || die "The install, the build, or the tests failed at $BUILD_AT."
STAGE="$WORKTREE/$PACKAGE_DIR"
[[ "$(json_field "$STAGE/package.json" version)" == "$VERSION" ]] ||
  die "$BUILD_AT's $MANIFEST isn't version $VERSION."
info "Built and tested at $BUILD_AT."

# ─── What's in the package ──────────────────────────────────────────

# The bundle carries everything it needs, so the package has no dependencies: nothing to lock,
# nothing to audit, and nothing that runs on install.
info "Checking the packed files..."
PACKED="$WORK/packed"
mkdir "$PACKED"
# The shared chunk's name carries a content hash; it is checked by shape.
FILES=$(npm pack "$STAGE" --pack-destination "$PACKED" --json --ignore-scripts |
  node --input-type=commonjs -e '
    const [pack] = JSON.parse(require("fs").readFileSync(0, "utf8"));
    console.log(pack.files.map((f) => f.path.replace(/^dist\/shared-[A-Z0-9]+\.js$/, "dist/shared-<hash>.js")).sort().join("\n"));
  ')
EXPECTED=$(printf '%s\n' LICENSE README.md dist/cli.js dist/index.d.ts dist/index.js "dist/shared-<hash>.js" package.json)
[[ "$FILES" == "$EXPECTED" ]] ||
  die "The package should hold exactly package.json, README.md, LICENSE, and dist/'s cli.js, index.js, index.d.ts and one shared chunk; it holds:"$'\n'"$FILES"
head -1 "$STAGE/dist/cli.js" | grep -qx '#!/usr/bin/env node' ||
  die "dist/cli.js has no #!/usr/bin/env node line."
node --input-type=commonjs -e '
  const pkg = require(require("path").resolve(process.argv[1], "package.json"));
  const extra = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies", "scripts"]
    .filter((field) => field in pkg);
  if (extra.length > 0) { console.error(extra.join(", ")); process.exit(1); }
' "$STAGE" || die "The package.json has dependencies or scripts; it should have neither."
TARBALL=$(ls "$PACKED"/*.tgz)
info "7 files; no dependencies, no scripts: $(basename "$TARBALL")"

# ─── Install the real tarball and run it ────────────────────────────

info "Installing the packed tarball in a scratch project..."
SCRATCH="$WORK/scratch"
mkdir "$SCRATCH"
(
  cd "$SCRATCH"
  npm init -y >/dev/null
  npm install --ignore-scripts --no-audit --no-fund "$TARBALL" >/dev/null
  INSTALLED=$(npx --no-install ipsumify --version)
  [[ "$INSTALLED" == "$VERSION" ]] || {
    echo "ipsumify --version printed '$INSTALLED', expected '$VERSION'" >&2
    exit 1
  }
  # Seed 42 is the website's default: its text starts the same way everywhere.
  SAMPLE=$(npx --no-install ipsumify 1 --seed 42)
  [[ "$SAMPLE" == "Neque porro quisquam est,"* ]] || {
    echo "ipsumify 1 --seed 42 printed: ${SAMPLE:0:80}" >&2
    exit 1
  }
  [[ "$(npx --no-install ipsumify | grep -c .)" == 5 ]] || {
    echo "ipsumify with no arguments didn't print 5 paragraphs" >&2
    exit 1
  }
  set +e
  REFUSED=$(npx --no-install ipsumify --theme no-such-theme 2>&1 >/dev/null </dev/null)
  STATUS=$?
  set -e
  [[ "$STATUS" == 1 && "$REFUSED" == *"Invalid theme"* ]] || {
    echo "ipsumify with a bad theme exited $STATUS and said: $REFUSED" >&2
    exit 1
  }
  node --input-type=module -e '
    import ipsumify, { paragraphs } from "ipsumify";
    if (!ipsumify({ blocks: 1, seed: 42 }).startsWith("Neque porro") || paragraphs({ blocks: 3 }).length !== 3) process.exit(1);
  ' || {
    echo "import ipsumify from \"ipsumify\" didn't work" >&2
    exit 1
  }
) || die "The packed tarball didn't install and run."
info "The packed tarball installs, prints $VERSION, generates the expected text, and refuses a bad theme."

# ─── Dry run ────────────────────────────────────────────────────────

NPM_TAG=()
# A pre-release (1.2.3-rc.1) goes out as `next`, never as what `npx ipsumify` gets.
[[ "$VERSION" == *-* ]] && NPM_TAG=(--tag next)

info "npm publish --dry-run..."
npm publish "$TARBALL" --dry-run --access public --ignore-scripts ${NPM_TAG[@]+"${NPM_TAG[@]}"}

# What's in the release, and who made it: shown by a dry run as well as a publish, to look over
# before anything goes out. A commit's author and subject are anyone's words, so a control
# character in them is shown as an escape.
TO="${TAG_COMMIT:-$HEAD_COMMIT}"
PREVIOUS=$(git describe --tags --abbrev=0 "$TO^" 2>/dev/null || true)
if [[ -n "$PREVIOUS" ]]; then
  info "The commits since $PREVIOUS, and who made them:"
  git log --format='  %h  %an  %s' "$PREVIOUS..$TO" |
    node --input-type=commonjs -e '
      const text = require("fs").readFileSync(0, "utf8");
      const shown = (c) => "\\u{" + c.codePointAt(0).toString(16) + "}";
      process.stdout.write(text.replace(/(?![\n\t])[\p{Cc}\p{Cf}\u{2028}\u{2029}]/gu, shown));
    '
fi

if [[ "$DRY_RUN" == true ]]; then
  info "Dry run complete. Nothing was published or changed."
  exit 0
fi

# ─── Confirm ────────────────────────────────────────────────────────

echo ""
if [[ "$FIRST_TIME" == true ]]; then
  warn "About to publish $PACKAGE_NAME@$VERSION (FIRST TIME, public)."
else
  warn "About to publish $PACKAGE_NAME@$VERSION."
fi
read -r -p "To publish it, type the version ($VERSION): " REPLY || REPLY=""
[[ "$REPLY" == "$VERSION" ]] || {
  info "Aborted. Nothing was published."
  exit 0
}

# ─── Publish ────────────────────────────────────────────────────────

# npm approves every publish itself, after every check and the typed version: it prints a link to
# open in a browser on any device (or, for some accounts, asks for its code here), and waits.
[[ -t 0 && -t 1 ]] ||
  die "npm can only show its approval link in a terminal, so nothing was published. Run ./publish.sh in a terminal (in Git Bash on Windows, under winpty or in Windows Terminal)."
info "npm will now ask you to approve this: open its link, or type its code."
# The tarball that was installed and run above, not a new one packed from the folder.
npm publish "$TARBALL" --access public --ignore-scripts --auth-type=web ${NPM_TAG[@]+"${NPM_TAG[@]}"}

# npm publish exited 0, so the release is published (a failed publish stopped the script above).
# The registry can take 5 to 10 minutes to list a new version: ask every 20 seconds for up to 15
# minutes, saying so each minute. If it still isn't listed, that's a warning, never a failure.
POLL_SECONDS=20
POLL_FOR_SECONDS=900
listed() {
  [[ "$(npm view "$PACKAGE_NAME@$VERSION" version 2>/dev/null || true)" == "$VERSION" ]]
}
waited=0
until listed; do
  if ((waited >= POLL_FOR_SECONDS)); then
    echo ""
    warn "npm accepted the publish, but doesn’t list it yet; that can take a while. Check https://www.npmjs.com/package/$PACKAGE_NAME later. Don’t run ./publish.sh again for this version."
    exit 0
  fi
  if ((waited % 60 == 0)); then
    info "Published. Waiting for npm to list it (this can take 5–10 minutes)…"
  fi
  sleep "$POLL_SECONDS"
  waited=$((waited + POLL_SECONDS))
done

echo ""
info "Published $PACKAGE_NAME@$VERSION."
info "npm: https://www.npmjs.com/package/$PACKAGE_NAME"
info "Try it: npx -y $PACKAGE_NAME@$VERSION --help"
