import type { SettingDefinitionItem } from 'obsidian';

export interface JournalCreaterSettings {
	/** Vault-relative folder for new journal pages. Empty means the vault root. */
	folder: string;
}

export const DEFAULT_SETTINGS: JournalCreaterSettings = {
	folder: '',
};

/** Copy for the journal folder setting, shared by both rendering paths. */
export const JOURNAL_FOLDER_SETTING = {
	name: 'Journal folder',
	desc: 'Folder for new journal pages, for example journal/2026. Leave empty to use the vault root. The folder is created if it does not exist.',
	placeholder: 'Vault root',
} as const;

/**
 * Declarative description of the plugin's settings, used by Obsidian 1.13+ to
 * render the settings tab and to index it for settings search. Kept free of
 * runtime `obsidian` imports so it can be unit tested outside the app.
 */
export function journalSettingDefinitions(): SettingDefinitionItem[] {
	return [
		{
			name: JOURNAL_FOLDER_SETTING.name,
			desc: JOURNAL_FOLDER_SETTING.desc,
			control: {
				type: 'folder',
				key: 'folder',
				defaultValue: DEFAULT_SETTINGS.folder,
				placeholder: JOURNAL_FOLDER_SETTING.placeholder,
			},
		},
	];
}
