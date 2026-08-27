import type { SettingDefinitionControl, SettingFolderControl } from 'obsidian';
import { describe, expect, test } from 'vitest';
import {
	DEFAULT_SETTINGS,
	journalSettingDefinitions,
} from './settingDefinitions';

function onlyDefinition(): SettingDefinitionControl {
	const definitions = journalSettingDefinitions();
	expect(definitions).toHaveLength(1);
	return definitions[0] as SettingDefinitionControl;
}

describe('journalSettingDefinitions', () => {
	test('describes the journal folder setting', () => {
		const definition = onlyDefinition();

		expect(definition.name).toBe('Journal folder');
		expect(definition.desc).toContain('journal/2026');
	});

	test('binds a folder control to the folder setting key', () => {
		const control = onlyDefinition().control as SettingFolderControl;

		expect(control.type).toBe('folder');
		expect(control.key).toBe('folder');
	});

	test('defaults to the same value as DEFAULT_SETTINGS', () => {
		const control = onlyDefinition().control as SettingFolderControl;

		expect(control.defaultValue).toBe(DEFAULT_SETTINGS.folder);
	});

	test('placeholder tells the user that empty means the vault root', () => {
		const control = onlyDefinition().control as SettingFolderControl;

		expect(control.placeholder).toBe('Vault root');
	});
});
