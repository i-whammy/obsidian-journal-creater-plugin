import { App, PluginSettingTab, Setting } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import type JournalCreaterPlugin from './main';
import {
	JOURNAL_FOLDER_SETTING,
	journalSettingDefinitions,
} from './settingDefinitions';

export type { JournalCreaterSettings } from './settingDefinitions';
export { DEFAULT_SETTINGS } from './settingDefinitions';

export class JournalCreaterSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: JournalCreaterPlugin,
	) {
		super(app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return journalSettingDefinitions();
	}

	// Obsidian 1.13+ renders from getSettingDefinitions() and never calls this.
	// It stays only as the fallback for the 1.5.7..1.12.x range that
	// manifest.json still supports, and can go once minAppVersion reaches
	// 1.13.0.
	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(JOURNAL_FOLDER_SETTING.name)
			.setDesc(JOURNAL_FOLDER_SETTING.desc)
			.addText((text) =>
				text
					.setPlaceholder(JOURNAL_FOLDER_SETTING.placeholder)
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
