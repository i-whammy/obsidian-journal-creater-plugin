import type { TFile, TFolder } from 'obsidian';
import { describe, expect, test } from 'vitest';
import {
	createJournalPage,
	formatJournalTimestamp,
	journalFileName,
	journalFilePath,
	normalizeFolderPath,
} from './journal';

const AT_21_36_05 = new Date(2026, 7, 25, 21, 36, 5);

describe('formatJournalTimestamp', () => {
	test('formats a local date as YYYYMMDDHHmmss', () => {
		expect(formatJournalTimestamp(AT_21_36_05)).toBe('20260825213605');
	});

	test('zero-pads single-digit month, day, hour, minute and second', () => {
		expect(formatJournalTimestamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
			'20260102030405',
		);
	});

	test('uses a 24-hour clock', () => {
		expect(formatJournalTimestamp(new Date(2026, 11, 31, 23, 59, 59))).toBe(
			'20261231235959',
		);
	});

	test('renders midnight as 000000', () => {
		expect(formatJournalTimestamp(new Date(2026, 11, 31, 0, 0, 0))).toBe(
			'20261231000000',
		);
	});
});

describe('journalFileName', () => {
	test('prefixes the timestamp with journal_ and adds the .md extension', () => {
		expect(journalFileName(AT_21_36_05)).toBe('journal_20260825213605.md');
	});
});

describe('normalizeFolderPath', () => {
	test('treats an empty string as the vault root', () => {
		expect(normalizeFolderPath('')).toBe('');
	});

	test('treats whitespace as the vault root', () => {
		expect(normalizeFolderPath('   ')).toBe('');
	});

	test('treats a lone slash as the vault root', () => {
		expect(normalizeFolderPath('/')).toBe('');
	});

	test('strips surrounding whitespace', () => {
		expect(normalizeFolderPath('  journal  ')).toBe('journal');
	});

	test('strips leading and trailing slashes', () => {
		expect(normalizeFolderPath('/journal/2026/')).toBe('journal/2026');
	});

	test('leaves an already normalized nested path untouched', () => {
		expect(normalizeFolderPath('journal/2026')).toBe('journal/2026');
	});
});

describe('journalFilePath', () => {
	test('puts the file at the vault root when no folder is configured', () => {
		expect(journalFilePath('', AT_21_36_05)).toBe('journal_20260825213605.md');
	});

	test('puts the file inside the configured folder', () => {
		expect(journalFilePath('journal/2026', AT_21_36_05)).toBe(
			'journal/2026/journal_20260825213605.md',
		);
	});

	test('normalizes the configured folder', () => {
		expect(journalFilePath('/journal/', AT_21_36_05)).toBe(
			'journal/journal_20260825213605.md',
		);
	});
});

describe('createJournalPage', () => {
	function fakeVault(existingFolders: string[] = []) {
		const folders = new Set(existingFolders);
		const createdFiles: { path: string; data: string }[] = [];
		const createdFolders: string[] = [];
		return {
			createdFiles,
			createdFolders,
			getFolderByPath: (path: string) =>
				folders.has(path) ? ({ path } as TFolder) : null,
			createFolder: async (path: string) => {
				createdFolders.push(path);
				folders.add(path);
				return { path } as TFolder;
			},
			create: async (path: string, data: string) => {
				createdFiles.push({ path, data });
				return { path } as TFile;
			},
		};
	}

	test('creates an empty markdown file at the vault root by default', async () => {
		const vault = fakeVault();

		await createJournalPage(vault, '', AT_21_36_05);

		expect(vault.createdFiles).toEqual([
			{ path: 'journal_20260825213605.md', data: '' },
		]);
		expect(vault.createdFolders).toEqual([]);
	});

	test('creates the file inside the configured folder', async () => {
		const vault = fakeVault(['journal']);

		await createJournalPage(vault, 'journal', AT_21_36_05);

		expect(vault.createdFiles).toEqual([
			{ path: 'journal/journal_20260825213605.md', data: '' },
		]);
	});

	test('leaves an existing folder alone', async () => {
		const vault = fakeVault(['journal']);

		await createJournalPage(vault, 'journal', AT_21_36_05);

		expect(vault.createdFolders).toEqual([]);
	});

	test('creates the configured folder when it does not exist', async () => {
		const vault = fakeVault();

		await createJournalPage(vault, 'journal', AT_21_36_05);

		expect(vault.createdFolders).toEqual(['journal']);
	});

	test('creates every missing ancestor of a nested folder, outermost first', async () => {
		const vault = fakeVault();

		await createJournalPage(vault, 'journal/2026/08', AT_21_36_05);

		expect(vault.createdFolders).toEqual([
			'journal',
			'journal/2026',
			'journal/2026/08',
		]);
	});

	test('only creates the ancestors that are missing', async () => {
		const vault = fakeVault(['journal']);

		await createJournalPage(vault, 'journal/2026', AT_21_36_05);

		expect(vault.createdFolders).toEqual(['journal/2026']);
	});

	test('returns the created file', async () => {
		const vault = fakeVault();

		const file = await createJournalPage(vault, 'journal', AT_21_36_05);

		expect(file.path).toBe('journal/journal_20260825213605.md');
	});
});
