# @wotzebra/oxc-config

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter.html), [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) and ESLint configuration for the Nuxt 4 projects. The rules live here once; every project installs the package and passes only what differs.

The package ships plain `.js` with `.d.ts` beside it. Node does not strip types from files inside `node_modules`, so raw `.ts` sources would not load from a shared package.

## Install

```sh
npm i -D github:wotzebra/oxc-config
# or
pnpm add -D github:wotzebra/oxc-config
```

Peer dependencies the project already has: `oxlint`, `oxfmt`, `oxc-nuxt`, and for the ESLint part `eslint`, `@nuxt/eslint`, `@nuxt/eslint-plugin`, `eslint-plugin-jsonc`, `eslint-plugin-oxlint`.

The TypeScript config files need Node 22.18 or newer (native type stripping). Pin that in `engines` and on CI.

## oxlint

`oxlint.config.ts` (delete `.oxlintrc.json` if present; the two cannot coexist):

```ts
import { withNuxt } from './.nuxt/oxlint.mjs';
import { oxlintConfig } from '@wotzebra/oxc-config/oxlint';

export default withNuxt(
	oxlintConfig({
		// everything here is optional
		ignorePatterns: ['**/_source'],
		rules: {
			'no-console': 'warn'
		}
	})
);
```

Every rule in oxlint's `correctness` category is on. The shared `rules` only add non-correctness rules, set options, and turn a few rules off per file type. Three type-aware rules (`typescript/unbound-method`, `typescript/restrict-template-expressions`, `typescript/no-base-to-string`) are warnings rather than errors.

`withNuxt()` comes from the `oxc-nuxt` module and injects the Nuxt auto-import globals plus the default plugin set, so it must stay in the project (it needs `nuxt prepare` to have run).

`oxlintConfig()` merges your overrides into the shared base:

| Key                                         | Merge strategy |
| ------------------------------------------- | -------------- |
| `ignorePatterns`, `overrides`, `jsPlugins`  | appended       |
| `rules`, `env`, `categories`, `globals`, `settings` | shallow-merged, yours win |
| anything else                               | replaces       |

oxlint's own `extends` only merges `rules`, `plugins` and `overrides`, which is why the helper exists. If you prefer the built-in mechanism, `base` is exported too: `defineConfig({ extends: [base] })`.

## oxfmt

`oxfmt.config.ts` (delete `.oxfmtrc.json`; the two cannot coexist):

```ts
import { oxfmtConfig } from '@wotzebra/oxc-config/oxfmt';

export default oxfmtConfig({
	ignorePatterns: ['server/db/migrations']
});
```

Or, with nothing project-specific:

```ts
export { default } from '@wotzebra/oxc-config/oxfmt';
```

oxfmt has no `extends`. `oxfmtConfig()` appends `ignorePatterns` and `overrides` and lets every other key replace the base value.

The shared `ignorePatterns` already skip `package.json`, lockfiles and `*.md` (oxfmt's markdown formatter corrupts Nuxt Content MDC syntax), so `.oxfmtignore` and the `--ignore-path` flag can go:

```json
{
	"format": "oxfmt",
	"format:check": "oxfmt --check"
}
```

## ESLint

ESLint still owns the stylistic rules (script indentation, attribute line breaks, attribute casing) that oxlint does not have. Template indentation is left to oxfmt: `vue/html-indent` is off because it rejects how oxfmt wraps inline elements with text content. `vue/require-default-prop` is off too: optional props typed `?: T` already default to `undefined`. `eslint.config.mjs`:

```js
import withNuxt from './.nuxt/eslint.config.mjs';
import { eslintConfigs } from '@wotzebra/oxc-config/eslint';

import oxlint from './oxlint.config.ts';

export default withNuxt(
	...eslintConfigs({
		oxlint,
		ignores: ['_source/**'],
		rules: { 'link-checker/valid-sitemap-link': 'off' },
		vueRules: {}
	})
);
```

The `oxlint` option is the project's resolved oxlint config. `eslint-plugin-oxlint` reads it and switches off in ESLint exactly the rules oxlint runs, nothing more, so a rule is never silently unchecked by both tools. Omit it and the shared base is used instead.

Rules the oxlint config switches **off** (`typescript/no-explicit-any`, `typescript/ban-ts-comment`, ...) are switched off in ESLint as well, for the same files. `eslint-plugin-oxlint` alone leaves those on, so @nuxt/eslint's defaults would report them again. A project can still turn one back on through `rules` or `vueRules`.

## Updating rules

Change the rule here, bump `version` in `package.json`, push, then in each project:

```sh
npm update @wotzebra/oxc-config
```

Pin to a tag or commit for reproducible installs: `github:wotzebra/oxc-config#v0.1.0`.
