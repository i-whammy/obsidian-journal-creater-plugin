import type { TFile, TFolder } from 'obsidian';

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

/** Builds the file name for a journal page. */
export function journalFileName(date: Date): string {
	return `journal_${formatJournalTimestamp(date)}.md`;
}

/**
 * Cleans up a user-entered folder path. An empty result means the vault root.
 */
export function normalizeFolderPath(folder: string): string {
	return folder.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

/** Builds the vault-relative path of a journal page in the given folder. */
export function journalFilePath(folder: string, date: Date): string {
	const normalized = normalizeFolderPath(folder);
	const name = journalFileName(date);
	return normalized === '' ? name : `${normalized}/${name}`;
}

/** The slice of Obsidian's `Vault` that creating a journal page needs. */
export interface JournalVault {
	getFolderByPath(path: string): TFolder | null;
	createFolder(path: string): Promise<TFolder>;
	create(path: string, data: string): Promise<TFile>;
}

/**
 * Creates the folder and every missing ancestor it needs, outermost first.
 * `createFolder` is not documented as recursive, so each level is checked.
 */
async function ensureFolderExists(
	vault: JournalVault,
	folder: string,
): Promise<void> {
	const segments = folder.split('/');
	let path = '';
	for (const segment of segments) {
		path = path === '' ? segment : `${path}/${segment}`;
		if (vault.getFolderByPath(path) === null) {
			await vault.createFolder(path);
		}
	}
}

/**
 * Creates an empty journal page in the given folder (the vault root when the
 * folder is empty), creating the folder if it does not exist yet.
 */
export async function createJournalPage(
	vault: JournalVault,
	folder: string,
	date: Date,
): Promise<TFile> {
	const normalized = normalizeFolderPath(folder);
	if (normalized !== '') {
		await ensureFolderExists(vault, normalized);
	}
	return vault.create(journalFilePath(normalized, date), '');
}
