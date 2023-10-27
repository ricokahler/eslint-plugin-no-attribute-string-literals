import { RuleTester } from '@typescript-eslint/rule-tester';
import { noAttributeStringLiterals } from './no-attribute-string-literals';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run(
  'no-attribute-string-literals',
  // @ts-expect-error
  noAttributeStringLiterals,
  {
    valid: [
      {
        code: '<Button someAttribute />',
      },
      {
        code: '<> <Button tone="primary" /> <Checkbox tone="default" /> </>',
        options: [{ ignore: { values: ['primary', 'default'] } }],
      },
      {
        code: '<Box theme="dark-mode" />',
        options: [{ ignore: { valuePatterns: ['^dark-\\w+'] } }],
      },
      {
        code: '<Button as="a" href="https://example.com">click me</Button>',
        options: [{ ignore: { attributes: ['as', 'href'] } }],
      },
      {
        code: '<Button data-testid="button" />',
        options: [{ ignore: { attributePatterns: ['^data-\\w+'] } }],
      },
      {
        code: '<Button:namespace ignored="this comp is ignored now" />',
        options: [{ ignore: { components: ['Button:namespace'] } }],
      },
      {
        code: '<Some.Provider ignored="this comp is ignored now" />',
        options: [{ ignore: { componentPatterns: ['\\w+\\.Provider$'] } }],
      },
      {
        code: '<Button as="p" />',
        options: [
          {
            ignore: {
              and: [{ components: ['Button'] }, { attributes: ['as'] }],
            },
          },
        ],
      },
      {
        code: '<Ignored prop="this is ignored now" />',
        options: [{ only: { components: ['Button'] } }],
      },
    ],
    invalid: [
      {
        code: '<Button someStringAttr="hello" />',
        errors: [
          'Attribute `someStringAttr` on component `Button` has invalid string literal `hello`.',
        ],
      },
      {
        code: '<> <Ignored prop="this is ignored now" /> <Button prop="wrong" /> </>',
        options: [{ only: { components: ['Button'] } }],
        errors: [
          'Attribute `prop` on component `Button` has invalid string literal `wrong`.',
        ],
      },
      {
        code: '<> <NotButton as={"p"} /> <Button notAs="p" /> </>',
        options: [
          {
            ignore: {
              and: [{ components: ['Button'] }, { attributes: ['as'] }],
            },
          },
        ],
        errors: [
          'Attribute `as` on component `NotButton` has invalid string literal `p`.',
          'Attribute `notAs` on component `Button` has invalid string literal `p`.',
        ],
      },
      {
        code: '<> <Button as="p" /> <Other prop="hey" /> </>',
        options: [
          {
            only: {
              and: [{ components: ['Button'] }, { attributes: ['as'] }],
            },
          },
        ],
        errors: [
          'Attribute `as` on component `Button` has invalid string literal `p`.',
        ],
      },
    ],
  },
);
