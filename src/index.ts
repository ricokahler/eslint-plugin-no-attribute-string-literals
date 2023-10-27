import type { ESLint } from 'eslint';

import { noAttributeStringLiterals } from './no-attribute-string-literals';

const plugin: ESLint.Plugin = {
  rules: { 'no-attribute-string-literals': noAttributeStringLiterals },
};

export type {
  InputOption,
  NoAttributeStringLiteralsRuleOptions,
} from './no-attribute-string-literals';

export default plugin;
