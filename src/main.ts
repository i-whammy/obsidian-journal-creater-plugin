import { Notice, Plugin } from 'obsidian';
import { createJournalPage } from './journal';
import {
	DEFAULT_SETTINGS,
	JournalCreaterSettingTab,
	JournalCreaterSettings,
} from './settings';

export default class JournalCreaterPlugin extends Plugin {
	settings!: JournalCreaterSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'create-journal-page',
			name: 'Create journal page',
			callback: () => {
				void this.createAndOpenJournalPage();
			},
		});

		this.addSettingTab(new JournalCreaterSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<JournalCreaterSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async createAndOpenJournalPage() {
		try {
			const file = await createJournalPage(
				this.app.vault,
				this.settings.folder,
				new Date(),
			);
			await this.app.workspace.getLeaf(false).openFile(file);
		} catch (error) {
			new Notice(
				`Could not create journal page: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
