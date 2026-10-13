/**
 * Shared oxfmt configuration.
 *
 * oxfmt has no `extends`, so projects import `oxfmtConfig()` and pass only
 * what differs. `ignorePatterns` replaces the per-project `.oxfmtignore`;
 * patterns are gitignore-style and rooted at the project's config file.
 */

/** @type {import('oxfmt').OxfmtConfig} */
export const base = {
	printWidth: 120,
	useTabs: true,
	tabWidth: 2,
	semi: true,
	singleQuote: true,
	trailingComma: 'none',
	singleAttributePerLine: true,
	bracketSameLine: true,
	sortImports: true,
	sortTailwindcss: true,
	vueIndentScriptAndStyle: true,
	ignorePatterns: [
		// package.json is left alone on purpose, which is also why sortPackageJson is not set.
		'package.json',
		'package-lock.json',
		'pnpm-lock.yaml',
		// oxfmt's markdown formatter rewrites Nuxt Content MDC syntax
		// (::Component + `---` YAML props) as headings/HR and corrupts content.
		'*.md'
	]
};

/**
 * Merge project overrides into the shared base.
 * `ignorePatterns` and `overrides` are appended; every other key replaces the base value.
 *
 * @param {import('oxfmt').OxfmtConfig} [overrides]
 * @returns {import('oxfmt').OxfmtConfig}
 */
export function oxfmtConfig(overrides = {}) {
	return {
		...base,
		...overrides,
		ignorePatterns: [...(base.ignorePatterns ?? []), ...(overrides.ignorePatterns ?? [])],
		overrides: [...(base.overrides ?? []), ...(overrides.overrides ?? [])]
	};
}

export default base;
