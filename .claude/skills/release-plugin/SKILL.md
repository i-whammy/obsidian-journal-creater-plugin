---
name: release-plugin
description: Release this Obsidian plugin end to end - decide the next semantic version with the user, write the CHANGELOG entry, bump package.json/manifest.json/versions.json, commit, push, tag, and watch the release workflow. Use this skill whenever the user asks to release, cut a release, prepare a release, publish a new version, bump the version, or tag a version - including casual phrasings like "リリース準備をして", "リリースして", "バージョン上げて", "タグ切って", or "1.1.0 で出して". Use it even when the user only mentions one part of the flow (e.g. "changelog を書いて" ahead of a release), because the steps depend on each other.
---

# Releasing this plugin

Releasing is a short, mostly mechanical sequence, but three of its steps are irreversible:
pushing to `main`, pushing a tag, and the CI job that fires on that tag and drafts a GitHub
release. So the shape of this skill is: do all the reversible work first, show it to the user,
and only touch the remote once they have seen exactly what is about to go out.

Work through the phases in order. Each phase says what to stop for.

## What this repo's release consists of

- `package.json` and `manifest.json` carry the version; `versions.json` maps plugin version →
  `minAppVersion`; `package-lock.json` mirrors `package.json`.
- `npm version <x.y.z> --no-git-tag-version` updates all four at once — the `version` npm script
  runs `version-bump.mjs`, which writes `manifest.json` and appends to `versions.json`, then
  stages both. This is why the flow uses `npm version` instead of hand-editing: hand-editing is
  how `versions.json` ended up missing its `1.0.2` entry.
- `CHANGELOG.md` is the source of truth for release notes, written in English.
- Pushing a tag triggers `.github/workflows/release.yml`, which builds and creates a **draft**
  GitHub release with `main.js` / `manifest.json` attached. Publishing that draft is the user's
  call, not yours.
- Release branch is `main` (`origin/HEAD` still points at `master` — ignore that).
- `main.js` is gitignored, so running a build never dirties the tree.

## Phase 1 — Preflight

```bash
git rev-parse --abbrev-ref HEAD
git status --short
git fetch --tags origin
git log --oneline origin/main..HEAD
```

- **Not on `main`**: stop and ask. Releasing from another branch is almost always a mistake.
- **Dirty tree**: stop. Show the changed files and let the user commit or stash them, then start
  over. Do not fold stray changes into the release commit — the user chose this so that a release
  commit stays a release commit.
- If `origin/main` is ahead, pull first so the release sits on top of everything.

Find the previous release: `git describe --tags --abbrev=0` (currently the tags are bare `x.y.z`,
no `v` prefix — keep it that way).

## Phase 2 — Decide the version

Read what actually changed since the last tag:

```bash
git log --oneline <last-tag>..HEAD
git diff <last-tag>..HEAD --stat
```

Then read the diff of anything that looks user-facing — a new command, a new setting, changed
behaviour, a bug fix. You need to understand the change well enough to write release notes, and
that same understanding is what decides major/minor/patch.

Apply SemVer from the *plugin user's* point of view, not the code's:

- **major** — an existing command, setting, or saved-data shape changes in a way that breaks
  someone's current setup.
- **minor** — new user-visible capability, backwards compatible.
- **patch** — bug fixes, internal refactors, dependency bumps, docs.

Propose one with a one-line reason ("1.1.0 — new setting, nothing breaks for existing users") and
**wait for the user to confirm**. This is the one decision that is genuinely theirs; everything
downstream follows from it.

If the user already named a version ("1.1.0 で出して"), skip the proposal and use it — just sanity
check that it is greater than the last tag.

### minAppVersion

If the change uses an Obsidian API that is newer than the current `minAppVersion` in
`manifest.json` (as `1.0.1` did with `getFolderByPath`), say so and ask whether to raise it —
`version-bump.mjs` copies whatever is in `manifest.json` into `versions.json`, so it has to be
right *before* the bump. If nothing suggests a newer API, don't ask; leave it alone.

## Phase 3 — Checks

```bash
npm run build && npm run test && npm run lint
```

Run these before touching any file. If any fails, stop and report the output — do not "fix it
quickly" as part of a release, and do not proceed. A release that ships a failing build wastes a
version number, since tags here are effectively permanent.

## Phase 4 — Write the CHANGELOG entry

Prepend a section to `CHANGELOG.md`, directly under the `# Changelog` heading, matching the
existing style: `## x.y.z`, then `### Added` / `### Changed` / `### Fixed` / `### Notes`
subsections — only the ones that apply.

The existing entries are the spec, so read `1.0.1` before writing. What makes them good:

- They are written for someone using the plugin in Obsidian, not for someone reading the diff.
  "Choose the vault folder new journal pages go into" — not "add `journalFolder` to settings".
- UI labels are bold and navigation uses arrows: **Settings → Community plugins**.
- Concrete examples where they help (`journal/2026`).
- `### Notes` covers "what does this mean for people already using it" — e.g. the default keeps
  old behaviour, or a `minAppVersion` bump means Obsidian 1.5.7+ is required.

English, sentence case, imperative where it is instructional.

Show the user the entry you wrote and let them edit it before anything is committed. Notes are
the part they are most likely to have an opinion about.

## Phase 5 — Bump

```bash
npm version <x.y.z> --no-git-tag-version
git status --short
```

Confirm all four files moved: `package.json`, `package-lock.json`, `manifest.json`,
`versions.json`. If `package-lock.json` did not pick up the new version, run `npm install` to
resync it — a lock file that disagrees with `package.json` makes `npm ci` fail in CI, which is
exactly where it hurts. If `versions.json` is missing entries for *earlier* released versions (it is
currently missing `1.0.2`), point that out and offer to add them in the same commit — the file is
what tells older Obsidian installs which plugin version they can use, so gaps are a real, if
quiet, bug.

## Phase 6 — Commit and push

Show the user the full diff about to be committed, and get an explicit go-ahead. This is the last
reversible moment.

```bash
git add -A
git commit -m "chore(release): <x.y.z>"
git push origin main
```

## Phase 7 — Tag and push

```bash
git tag -a <x.y.z> -m "<x.y.z>"
git push origin <x.y.z>
```

No `v` prefix — the tag must match `manifest.json`'s `version` exactly, because that is what
Obsidian's community catalog checks.

## Phase 8 — Watch the release build

```bash
gh run watch $(gh run list --workflow=release.yml --limit=1 --json databaseId --jq '.[0].databaseId') --exit-status
gh release view <x.y.z> --json url,isDraft --jq '.url'
```

Report the draft release URL and tell the user the release is a **draft** — they publish it
themselves. If the workflow fails, report the failing step's log; the tag is already public, so
the fix is normally a follow-up patch version rather than deleting the tag.

## Closing summary

Tell the user, briefly: the version released, the CHANGELOG headline, the commit and tag that
were pushed, and the draft release URL awaiting their publish.
