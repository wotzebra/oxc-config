/**
 * Shared oxlint configuration for Nuxt 4 projects.
 *
 * Projects wrap this with oxc-nuxt's `withNuxt()` (from `./.nuxt/oxlint.mjs`), which injects the
 * Nuxt auto-import globals and the default plugin set, so `globals` and `plugins` are omitted here.
 * Stylistic rules are intentionally omitted: ESLint (via @nuxt/eslint) owns those, see `./eslint.js`.
 *
 * oxlint's own `extends` only merges `rules`, `plugins` and `overrides`, so `oxlintConfig()` below
 * merges the remaining keys (`env`, `categories`, `globals`, `ignorePatterns`, `jsPlugins`) itself.
 */

/** @type {import('oxlint').OxlintConfig} */
export const base = {
	jsPlugins: ['@nuxt/eslint-plugin'],
	// Every rule in oxlint's `correctness` category is on. The lists below only add
	// non-correctness rules, configure options, or turn rules off for specific files.
	categories: {
		correctness: 'error'
	},
	env: {
		builtin: true,
		browser: true,
		es2024: true,
		node: true
	},
	ignorePatterns: [
		'**/.output',
		'**/.data',
		'**/.nuxt',
		'**/.nitro',
		'**/.cache',
		'**/dist',
		'**/node_modules',
		'**/logs',
		'**/*.log',
		'**/.DS_Store',
		'**/.fleet',
		'**/.idea',
		'**/.env',
		'**/.env.*',
		'!**/.env.example',
		'**/localhost-key.pem',
		'**/localhost.pem',
		'**/.wrangler',
		'**/.dev.vars',
		'**/.claude',
		'**/.vercel',
		'**/.netlify',
		'**/public'
	],
	rules: {
		'no-case-declarations': 'error',
		'no-empty': 'error',
		'no-fallthrough': 'error',
		'no-prototype-builtins': 'error',
		'no-redeclare': 'error',
		'no-regex-spaces': 'error',
		'no-unexpected-multiline': 'error',
		'import/first': 'error',
		'import/no-duplicates': 'error',
		'import/no-mutable-exports': 'error',
		'import/no-named-default': 'error',
		'@nuxt/prefer-import-meta': 'error',
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: ['~/*', '~~/*'],
						message: 'Use the @ alias (@/ for app, @@/ for the project root) instead of ~.'
					}
				]
			}
		],
		'no-unused-vars': [
			'error',
			{
				args: 'after-used',
				argsIgnorePattern: '^_',
				ignoreRestSiblings: true,
				vars: 'all',
				varsIgnorePattern: '^_'
			}
		],
		'typescript/unbound-method': 'warn',
		'typescript/restrict-template-expressions': 'warn',
		'typescript/no-base-to-string': 'warn'
	},
	overrides: [
		{
			files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.vue'],
			rules: {
				'constructor-super': 'off',
				'no-class-assign': 'off',
				'no-const-assign': 'off',
				'no-dupe-class-members': 'off',
				'no-dupe-keys': 'off',
				'no-func-assign': 'off',
				'no-import-assign': 'off',
				'no-new-native-nonconstructor': 'off',
				'no-obj-calls': 'off',
				'no-redeclare': 'off',
				'no-setter-return': 'off',
				'no-this-before-super': 'off',
				'no-unsafe-negation': 'off',
				'no-var': 'error',
				'no-with': 'off',
				'prefer-const': 'error',
				'prefer-rest-params': 'error',
				'prefer-spread': 'error',
				'no-array-constructor': 'error',
				'no-useless-constructor': 'error',
				'valid-typeof': 'off',
				'typescript/ban-ts-comment': 'off',
				'typescript/no-empty-object-type': 'error',
				'typescript/no-explicit-any': 'off',
				'typescript/no-namespace': 'error',
				'typescript/no-require-imports': 'error',
				'typescript/no-unnecessary-type-constraint': 'error',
				'typescript/no-unsafe-function-type': 'error',
				'typescript/no-dynamic-delete': 'error',
				'typescript/no-extraneous-class': 'error',
				'typescript/no-invalid-void-type': 'error',
				'typescript/no-non-null-asserted-nullish-coalescing': 'error',
				'typescript/no-non-null-assertion': 'off',
				'typescript/prefer-literal-enum-member': 'error',
				'typescript/unified-signatures': 'error',
				'typescript/consistent-type-imports': [
					'error',
					{
						disallowTypeAnnotations: false,
						prefer: 'type-imports'
					}
				],
				'typescript/no-import-type-side-effects': 'error'
			},
			plugins: ['typescript']
		},
		{
			files: ['**/*.vue'],
			rules: {
				'vue/no-multiple-slot-args': 'warn',
				'vue/no-required-prop-with-default': 'warn'
			},
			plugins: ['vue']
		},
		{
			files: ['app/pages/**/*.{js,ts,jsx,tsx,vue}'],
			rules: {
				'@nuxt/no-page-meta-runtime-values': 'error'
			},
			jsPlugins: ['@nuxt/eslint-plugin']
		},
		{
			files: ['**/.config/nuxt.?([cm])[jt]s?(x)', '**/nuxt.config.?([cm])[jt]s?(x)'],
			rules: {
				'@nuxt/no-nuxt-config-test-key': 'error'
			},
			jsPlugins: ['@nuxt/eslint-plugin']
		}
	]
};

/**
 * Merge project overrides into the shared base.
 * Arrays (`ignorePatterns`, `overrides`, `jsPlugins`) are appended, objects (`rules`, `env`,
 * `categories`, `globals`, `settings`) are shallow-merged, and anything else replaces the base value.
 *
 * @param {import('oxlint').OxlintConfig} [overrides]
 * @returns {import('oxlint').OxlintConfig}
 */
export function oxlintConfig(overrides = {}) {
	return {
		...base,
		...overrides,
		jsPlugins: unique([...(base.jsPlugins ?? []), ...(overrides.jsPlugins ?? [])]),
		categories: { ...base.categories, ...overrides.categories },
		env: { ...base.env, ...overrides.env },
		globals: { ...base.globals, ...overrides.globals },
		settings: { ...base.settings, ...overrides.settings },
		ignorePatterns: [...(base.ignorePatterns ?? []), ...(overrides.ignorePatterns ?? [])],
		rules: { ...base.rules, ...overrides.rules },
		overrides: [...(base.overrides ?? []), ...(overrides.overrides ?? [])]
	};
}

/** @template T @param {T[]} list @returns {T[]} */
function unique(list) {
	return [...new Set(list)];
}

export default base;
