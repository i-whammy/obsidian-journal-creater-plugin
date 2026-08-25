import type { TFile } from 'obsidian';

function pad(value: number, length: number): string {
	return String(value).padStart(length, '0');
}

/** Formats a date in local time as `YYYYMMDDHHmmss`. */
export function formatJournalTimestamp(date: Date): string {
	return (
		pad(date.getFullYear(), 4) +
		pad(date.getMonth() + 1, 2) +
		pad(date.getDate(), 2) +
		pad(date.getHours(), 2) +
		pad(date.getMinutes(), 2) +
		pad(date.getSeconds(), 2)
	);
}

/** Builds the vault-root-relative file name for a journal page. */
export function journalFileName(date: Date): string {
	return `journal_${formatJournalTimestamp(date)}.md`;
}

/** The slice of Obsidian's `Vault` that creating a journal page needs. */
export interface JournalVault {
	create(path: string, data: string): Promise<TFile>;
}

/** Creates an empty journal page at the vault root and returns it. */
export function createJournalPage(
	vault: JournalVault,
	date: Date,
): Promise<TFile> {
	return vault.create(journalFileName(date), '');
}
