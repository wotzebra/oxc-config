import type { OxlintConfig } from 'oxlint';

/** The shared oxlint settings, unmodified. Wrap with oxc-nuxt's `withNuxt()` in a project. */
export declare const base: OxlintConfig;

/**
 * Merge project overrides into the shared base.
 * Arrays (`ignorePatterns`, `overrides`, `jsPlugins`) are appended, objects (`rules`, `env`,
 * `categories`, `globals`, `settings`) are shallow-merged, and anything else replaces the base value.
 */
export declare function oxlintConfig(overrides?: OxlintConfig): OxlintConfig;

export default base;
