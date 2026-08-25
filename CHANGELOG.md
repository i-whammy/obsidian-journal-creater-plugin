# Changelog

## 1.0.1

### Added

- **Journal folder setting** — choose the vault folder new journal pages go into
  (**Settings → Community plugins → Journal Creater**). For example, set it to
  `journal/2026` to keep pages out of the vault root.
- The chosen folder is created automatically the first time a page is written there,
  including any missing parent folders.
- Folder input is normalized, so stray whitespace or leading/trailing slashes no longer
  produce broken paths.

### Changed

- `minAppVersion` is now **1.5.7** (the setting relies on `getFolderByPath`, added in
  that release). Obsidian 1.5.7 or later is required.

### Notes

- The setting defaults to empty, which writes to the vault root exactly as before —
  existing users see no change until they set a folder.

## 1.0.0

Initial release.

- **Create journal page** command in the command palette: creates an empty
  `journal_YYYYMMDDHHmmss.md` (local time) in the vault root and opens it in the active
  pane. A hotkey can be assigned in **Settings → Hotkeys**.
- Failures — such as a name collision when the command runs twice within the same
  second — are surfaced as a Notice.
