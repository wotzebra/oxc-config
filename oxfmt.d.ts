import type { OxfmtConfig } from 'oxfmt';

/** The shared oxfmt settings, unmodified. */
export declare const base: OxfmtConfig;

/**
 * Merge project overrides into the shared base.
 * `ignorePatterns` and `overrides` are appended; every other key replaces the base value.
 */
export declare function oxfmtConfig(overrides?: OxfmtConfig): OxfmtConfig;

export default base;
