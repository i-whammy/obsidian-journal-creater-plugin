import { describe, expect, test } from 'vitest';
import type { TFile } from 'obsidian';
import {
	createJournalPage,
	formatJournalTimestamp,
	journalFileName,
} from './journal';

describe('formatJournalTimestamp', () => {
	test('formats a local date as YYYYMMDDHHmmss', () => {
		expect(formatJournalTimestamp(new Date(2026, 7, 25, 21, 36, 5))).toBe(
			'20260825213605',
		);
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
		expect(journalFileName(new Date(2026, 7, 25, 21, 36, 5))).toBe(
			'journal_20260825213605.md',
		);
	});
});

describe('createJournalPage', () => {
	function fakeVault() {
		const created: { path: string; data: string }[] = [];
		return {
			created,
			create: async (path: string, data: string) => {
				created.push({ path, data });
				return { path } as TFile;
			},
		};
	}

	test('creates an empty markdown file at the vault root', async () => {
		const vault = fakeVault();

		await createJournalPage(vault, new Date(2026, 7, 25, 21, 36, 5));

		expect(vault.created).toEqual([
			{ path: 'journal_20260825213605.md', data: '' },
		]);
	});

	test('returns the created file', async () => {
		const vault = fakeVault();

		const file = await createJournalPage(
			vault,
			new Date(2026, 7, 25, 21, 36, 5),
		);

		expect(file.path).toBe('journal_20260825213605.md');
	});
});
