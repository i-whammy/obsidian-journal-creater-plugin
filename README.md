# Journal Creater

An Obsidian plugin that creates a timestamped journal page in a folder of your choice.

## Usage

Open the command palette (`Ctrl/Cmd + P`) and run **Create journal page**.

The plugin creates an empty Markdown file named `journal_YYYYMMDDHHmmss.md` — where
the timestamp is the local date and time of creation — then opens it in the active pane.

Example: running the command at 2026-08-25 21:36:05 creates `journal_20260825213605.md`.

You can assign a hotkey to the command in **Settings → Hotkeys**.

## Settings

**Settings → Community plugins → Journal Creater**

- **Journal folder** — the vault folder new journal pages go into, for example
  `journal/2026`. Leave it empty to use the vault root. The folder, including any missing
  parent folders, is created automatically the first time a page is written there.

## Development

```bash
npm install
npm run dev    # watch build
npm run build  # type-check + production build
npm test       # unit tests (vitest)
npm run lint
```

## Manual install

Copy `main.js` and `manifest.json` into
`<Vault>/.obsidian/plugins/obsidian-journal-creater-plugin/`, then enable the plugin in
**Settings → Community plugins**.
