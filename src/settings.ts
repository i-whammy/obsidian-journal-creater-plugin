import { App, PluginSettingTab, Setting } from 'obsidian';
import type JournalCreaterPlugin from './main';

export interface JournalCreaterSettings {
	/** Vault-relative folder for new journal pages. Empty means the vault root. */
	folder: string;
}

export const DEFAULT_SETTINGS: JournalCreaterSettings = {
	folder: '',
};

// The declarative settings API (getSettingDefinitions) is not present in the
// `obsidian` typings this plugin builds against, so the classic display() tab is
// the only option for now. Revisit once the typings expose it.
export class JournalCreaterSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: JournalCreaterPlugin,
	) {
		super(app, plugin);
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Journal folder')
			.setDesc(
				'Folder for new journal pages, for example journal/2026. Leave empty to use the vault root. The folder is created if it does not exist.',
			)
			.addText((text) =>
				text
					.setPlaceholder('Vault root')
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
