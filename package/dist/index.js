'use strict';

function getComponentName(node) {
  switch (node.type) {
    case 'JSXIdentifier':
      {
        return node.name;
      }
    case 'JSXMemberExpression':
      {
        return `${getComponentName(node.object)}.${getComponentName(node.property)}`;
      }
    case 'JSXNamespacedName':
      {
        return `${getComponentName(node.namespace)}:${getComponentName(node.name)}`;
      }
    default:
      {
        return '';
      }
  }
}
function getAttributeValue(node) {
  if (!node) return null;
  if (node.type === 'Literal') return node.value?.toString() || null;
  if (node.type !== 'JSXExpressionContainer') return null;
  if (node.expression.type === 'JSXEmptyExpression') return null;
  const exp = node.expression;
  if (exp.type === 'Literal') return exp.value?.toString() || null;
  return null;
}
function getAttributeName(node) {
  return node.name.type === 'JSXNamespacedName' ? `${node.name.namespace.name}:${node.name.name.name}` : node.name.name;
}
const valueMatches = value => pattern => new RegExp(pattern).test(value);
function evaluate(input, attr) {
  if ('and' in input) return input.and.every(item => evaluate(item, attr));
  if ('or' in input) return input.or.some(item => evaluate(item, attr));
  if ('not' in input) return !evaluate(input.not, attr);
  const {
    attributePatterns,
    attributes,
    componentPatterns,
    components,
    valuePatterns,
    values
  } = input;
  if (attributes?.some(name => attr.name === name)) return true;
  if (attributePatterns?.some(valueMatches(attr.name))) return true;
  if (components?.some(comp => attr.component === comp)) return true;
  if (componentPatterns?.some(valueMatches(attr.component))) return true;
  if (values?.some(value => attr.value === value)) return true;
  if (valuePatterns?.some(valueMatches(attr.value))) return true;
  return false;
}
const noAttributeStringLiterals = {
  create(context) {
    const {
      only = [],
      ignore = []
    } = context.options[0] || {};
    const onlyInput = {
      or: Array.isArray(only) ? only : [only]
    };
    const ignoreInput = {
      or: Array.isArray(ignore) ? ignore : [ignore]
    };
    return {
      JSXOpeningElement(node) {
        const attributes = node.attributes.filter(n => n.type === 'JSXAttribute').map(attribute => ({
          component: getComponentName(node.name),
          name: getAttributeName(attribute),
          value: getAttributeValue(attribute.value),
          node: attribute
        })).filter(i => !!i.value).filter(i => onlyInput.or.length ? evaluate(onlyInput, i) : true).filter(i => !evaluate(ignoreInput, i));
        for (const attribute of attributes) {
          context.report({
            node: attribute.node,
            message: `Attribute \`${attribute.name}\` on component \`${attribute.component}\` has invalid string literal \`${attribute.value}\`.`
          });
        }
      }
    };
  }
};

const plugin = {
  rules: {
    'no-attribute-string-literals': noAttributeStringLiterals
  }
};

module.exports = plugin;
