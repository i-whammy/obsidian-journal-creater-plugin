import { Notice, Plugin } from 'obsidian';
import { createJournalPage } from './journal';

export default class JournalCreaterPlugin extends Plugin {
	onload() {
		this.addCommand({
			id: 'create-journal-page',
			name: 'Create journal page',
			callback: () => {
				void this.createAndOpenJournalPage();
			},
		});
	}

	private async createAndOpenJournalPage() {
		try {
			const file = await createJournalPage(this.app.vault, new Date());
			await this.app.workspace.getLeaf(false).openFile(file);
		} catch (error) {
			new Notice(
				`Could not create journal page: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
