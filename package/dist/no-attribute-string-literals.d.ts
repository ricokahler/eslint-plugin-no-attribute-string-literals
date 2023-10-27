import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type ESLint from 'eslint';
export interface NoAttributeStringLiteralsRuleOptions {
    /**
     * This is the primary filter used to specify exceptions or conditions for
     * which attributes should not be reported. Attributes matching its conditions
     * are excluded from being reported.
     */
    ignore?: InputOption | InputOption[];
    /**
     * This is a less commonly used option. If specified, only attributes matching
     * its conditions will be considered. If omitted, all attributes are initially
     * selected. If the only option is present with ignore, the only option will
     * determine which attributes to consider and then the ignore option is used
     * to ignore any attributes that match.
     */
    only?: InputOption | InputOption[];
}
export type InputOption = {
    and: InputOption[];
} | {
    or: InputOption[];
} | {
    not: InputOption;
} | {
    /**
     * List of attributes to match.
     *
     * For instance, to match the attribute `foo` in `<Component foo="text" />`,
     * add "foo" to this list.
     */
    attributes?: string[];
    /**
     * Regex patterns for attribute names.
     *
     * E.g., to match all `data-` attributes in `<Component data-testid="a" />`,
     * use the pattern "^data-\w+".
     */
    attributePatterns?: string[];
    /**
     * List of attribute values to match.
     *
     * For instance, to match the value `outlined` in `<Component variant="outlined" />`,
     * add "outlined" to this list.
     */
    values?: string[];
    /**
     * Regex patterns for attribute values.
     *
     * E.g., to match values like `dark-mode` in `<Component theme="dark-mode" />`,
     * use the pattern "^dark-\w+".
     */
    valuePatterns?: string[];
    /**
     * List of component names to match.
     *
     * For instance, to match the `<Button />` component,
     * add "Button" to this list.
     */
    components?: string[];
    /**
     * Regex patterns for component names.
     *
     * E.g., to match any component with "Btn" in its name like `<SubmitBtn />` or `<CancelBtn />`,
     * use the pattern ".*Btn".
     */
    componentPatterns?: string[];
};
export declare const noAttributeStringLiterals: {
    create(context: ESLint.Rule.RuleContext): {
        JSXOpeningElement(node: TSESTree.JSXOpeningElement): void;
    };
};
