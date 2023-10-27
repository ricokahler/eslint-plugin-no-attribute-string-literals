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

export type InputOption =
  | { and: InputOption[] }
  | { or: InputOption[] }
  | { not: InputOption }
  | {
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

interface AttributeEntry {
  component: string;
  name: string;
  value: string;
  node: TSESTree.JSXAttribute;
}

function getComponentName(node: TSESTree.JSXTagNameExpression): string {
  switch (node.type) {
    case 'JSXIdentifier': {
      return node.name;
    }
    case 'JSXMemberExpression': {
      return `${getComponentName(node.object)}.${getComponentName(
        node.property,
      )}`;
    }
    case 'JSXNamespacedName': {
      return `${getComponentName(node.namespace)}:${getComponentName(
        node.name,
      )}`;
    }
    default: {
      return '';
    }
  }
}

function getAttributeValue(node: TSESTree.JSXAttribute['value']) {
  if (!node) return null;
  if (node.type === 'Literal') return node.value?.toString() || null;
  if (node.type !== 'JSXExpressionContainer') return null;
  if (node.expression.type === 'JSXEmptyExpression') return null;
  const exp = node.expression;

  if (exp.type !== 'Literal') return null;
  if (typeof exp.value !== 'string') return null;
  return exp.value;
}

function getAttributeName(node: TSESTree.JSXAttribute) {
  return node.name.type === 'JSXNamespacedName'
    ? `${node.name.namespace.name}:${node.name.name.name}`
    : node.name.name;
}

const valueMatches = (value: string) => (pattern: string) =>
  new RegExp(pattern).test(value);

function evaluate(input: InputOption, attr: AttributeEntry): boolean {
  if ('and' in input) return input.and.every((item) => evaluate(item, attr));
  if ('or' in input) return input.or.some((item) => evaluate(item, attr));
  if ('not' in input) return !evaluate(input.not, attr);

  const {
    attributePatterns,
    attributes,
    componentPatterns,
    components,
    valuePatterns,
    values,
  } = input;

  if (attributes?.some((name) => attr.name === name)) return true;
  if (attributePatterns?.some(valueMatches(attr.name))) return true;

  if (components?.some((comp) => attr.component === comp)) return true;
  if (componentPatterns?.some(valueMatches(attr.component))) return true;

  if (values?.some((value) => attr.value === value)) return true;
  if (valuePatterns?.some(valueMatches(attr.value))) return true;

  return false;
}

export const noAttributeStringLiterals = {
  create(context) {
    const { only = [], ignore = [] } = (context.options[0] ||
      {}) as NoAttributeStringLiteralsRuleOptions;

    const onlyInput: InputOption = { or: Array.isArray(only) ? only : [only] };
    const ignoreInput: InputOption = {
      or: Array.isArray(ignore) ? ignore : [ignore],
    };

    return {
      JSXOpeningElement(node) {
        const attributes = node.attributes
          .filter(
            (n): n is Extract<typeof n, { type: 'JSXAttribute' }> =>
              n.type === 'JSXAttribute',
          )
          .map((attribute) => ({
            component: getComponentName(node.name),
            name: getAttributeName(attribute),
            value: getAttributeValue(attribute.value),
            node: attribute,
          }))
          .filter((i): i is AttributeEntry => typeof i.value === 'string')
          .filter((i) => (onlyInput.or.length ? evaluate(onlyInput, i) : true))
          .filter((i) => !evaluate(ignoreInput, i));

        for (const attribute of attributes) {
          context.report({
            node: attribute.node as unknown as import('estree').Node,
            message: `Attribute \`${attribute.name}\` on component \`${attribute.component}\` has invalid string literal \`${attribute.value}\`.`,
          });
        }
      },
    };
  },
} satisfies ESLint.Rule.RuleModule;
