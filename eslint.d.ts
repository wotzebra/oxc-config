import type { Linter } from 'eslint';
import type { OxlintConfig } from 'oxlint';

export interface EslintOptions {
	/** Extra ignore globs, appended to the shared list. */
	ignores?: string[];
	/** Extra rules applied to every file. */
	rules?: Linter.RulesRecord;
	/** Extra rules applied to `.vue` files only. */
	vueRules?: Linter.RulesRecord;
	/** The project's resolved oxlint config, so ESLint switches off exactly the rules oxlint runs. */
	oxlint?: OxlintConfig;
}

/**
 * Shared ESLint flat configs for the stylistic rules that oxlint does not cover.
 * Spread the result into `withNuxt()` from `./.nuxt/eslint.config.mjs`.
 */
export declare function eslintConfigs(options?: EslintOptions): Linter.Config[];

export default eslintConfigs;
