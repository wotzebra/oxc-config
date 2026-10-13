/**
 * Shared ESLint flat configs for the stylistic rules that oxlint does not cover.
 *
 * Projects spread the result into `withNuxt()` from `./.nuxt/eslint.config.mjs`.
 * `eslint-plugin-oxlint` goes last and switches off, in ESLint, exactly the rules oxlint runs.
 * It reads the resolved oxlint config (`oxlint` option), so pass the same object the project
 * exports from `oxlint.config.ts` to keep the two in sync. Without it the shared base is used.
 *
 * Rules the oxlint config switches off (e.g. `typescript/no-explicit-any`) are switched off in
 * ESLint too, so @nuxt/eslint's defaults do not bring them back. See `buildOffRulesConfigs()`.
 */
import jsonc from 'eslint-plugin-jsonc';
import oxlintPlugin from 'eslint-plugin-oxlint';

import { base as oxlintBase } from './oxlint.js';

/** @typedef {import('eslint').Linter.Config} Config */

/**
 * The plugin set oxc-nuxt's `withNuxt()` applies when a config declares none.
 * Used only when a project does not pass its resolved oxlint config.
 */
const { buildFromOxlintConfig } = oxlintPlugin;

const nuxtDefaultPlugins = ['typescript', 'oxc', 'import', 'vue', 'promise'];

/** @param {unknown} value */
const isOff = (value) => ['off', 0].includes(Array.isArray(value) ? value[0] : value);

/**
 * `eslint-plugin-oxlint` only switches off, in ESLint, the rules oxlint runs. A rule the oxlint
 * config sets to `off` stays on in ESLint when another config (e.g. @nuxt/eslint's defaults)
 * enables it. Flip those `off` rules to `error` and feed them through the same builder: the
 * result switches off, in ESLint, exactly the rules oxlint switches off, scoped to the same files
 * and with the same rule-name mapping (including `@typescript-eslint/` aliases).
 *
 * @param {import('oxlint').OxlintConfig} oxlintConfig
 * @returns {Config[]}
 */
function buildOffRulesConfigs(oxlintConfig) {
	/** @param {Record<string, unknown> | undefined} rules */
	const offRules = (rules = {}) =>
		Object.fromEntries(
			Object.entries(rules)
				.filter(([, value]) => isOff(value))
				.map(([rule]) => [rule, 'error'])
		);

	return buildFromOxlintConfig(
		{
			// Copies: the builder pushes into the plugin lists it gets.
			plugins: oxlintConfig.plugins && [...oxlintConfig.plugins],
			// Only the listed rules: without this, the builder falls back to its default categories.
			categories: { correctness: 'off' },
			rules: offRules(oxlintConfig.rules),
			overrides: (oxlintConfig.overrides ?? []).map((override) => ({
				files: override.files,
				plugins: override.plugins && [...override.plugins],
				rules: offRules(override.rules)
			}))
		},
		{ typeAware: true }
	).map((config) => ({ ...config, name: config.name?.replace(/^oxlint\//, 'oxc-config/oxlint-off/') }));
}

/**
 * @param {object} [options]
 * @param {string[]} [options.ignores] Extra ignore globs, appended to the shared list.
 * @param {Record<string, unknown>} [options.rules] Extra rules applied to every file.
 * @param {Record<string, unknown>} [options.vueRules] Extra rules applied to `.vue` files only.
 * @param {import('oxlint').OxlintConfig} [options.oxlint] The project's resolved oxlint config.
 * @returns {Config[]}
 */
export function eslintConfigs({ ignores = [], rules = {}, vueRules = {}, oxlint } = {}) {
	const oxlintConfig = oxlint ?? { ...oxlintBase, plugins: nuxtDefaultPlugins };
	return [
		{
			ignores: ['.nuxt/*', 'node_modules/*', '.data', '.wrangler', '.output', ...ignores]
		},
		...jsonc.configs['flat/recommended-with-json'],
		// Before the project's `rules` / `vueRules`, so a project can still switch one back on.
		...buildOffRulesConfigs(oxlintConfig),
		{
			files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
			rules: {
				'jsonc/indent': 'off'
			}
		},
		{
			files: ['**/tsconfig.json', '**/tsconfig.*.json', '**/wrangler.jsonc', '**/.vscode/*.json'],
			rules: {
				'jsonc/no-comments': 'off'
			}
		},
		{
			rules: {
				'nuxt/nuxt-config-keys-order': 'off',
				...rules
			}
		},
		{
			files: ['**/*.vue'],
			rules: {
				'vue/script-indent': ['error', 'tab', { baseIndent: 1, switchCase: 1 }],
				// oxfmt owns template indentation. For inline elements with text content it writes
				// `>{{ text }}</NuxtLink` one level deeper than the start tag, which this rule rejects,
				// and no option of the rule accepts that without breaking block elements.
				'vue/html-indent': 'off',
				indent: 'off',
				// oxfmt (printWidth 120, singleAttributePerLine) owns attribute wrapping;
				// this rule would fight it.
				'vue/max-attributes-per-line': 'off',
				'vue/first-attribute-linebreak': [
					'error',
					{
						singleline: 'ignore',
						multiline: 'below'
					}
				],
				// oxfmt owns closing-bracket placement (bracketSameLine). Any setting here fights it.
				'vue/html-closing-bracket-newline': 'off',
				// oxfmt writes void elements as `<br />`; the Nuxt default wants `<br >`.
				'vue/html-self-closing': ['warn', { html: { void: 'any' } }],
				'vue/attribute-hyphenation': ['error', 'never'],
				// oxfmt keeps short element content on one line (`<h3>Title</h3>`); this
				// rule demands a break around it, so oxfmt would just undo every fix.
				'vue/singleline-html-element-content-newline': 'off',
				// Optional props typed `?: T` already default to undefined; an explicit default is noise.
				'vue/require-default-prop': 'off',
				...vueRules
			}
		},
		...buildFromOxlintConfig(oxlintConfig, { typeAware: true })
	];
}

export default eslintConfigs;
