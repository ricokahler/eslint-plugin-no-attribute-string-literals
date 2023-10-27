# `no-attribute-string-literals` ESLint Plugin

Ensure JSX attributes follow specific naming or value constraints. This linter is especially useful for identifying strings in your code that should be localized.

## Installation

```bash
npm install eslint-plugin-no-attribute-string-literals --save-dev
```

## Usage

After installation, add the plugin to your ESLint configuration:

```js
{
  "plugins": ["no-attribute-string-literals"],
  "rules": {
    "no-attribute-string-literals/no-attribute-string-literals": [
      "error",
      // see below for option details
      {
        "only": [],
        "ignore": []
      }
    ]
  }
}
```

## Rule Details

This rule targets JSX attributes with string literals that don't follow specific constraints set by the user. The primary intention is to leverage the `ignore` option, which specifies which attributes are permissible. The `only` option can be utilized in unique scenarios where you'd like to focus on a particular subset of attributes, but it's less commonly used.

For instance:

### Valid

```jsx
<Button disabled size={3} />
```

### Invalid

```jsx
<Button variant="outlined" />
<Icon icon={"star"} />
```

## Options

```ts
interface NoAttributeStringLiteralsRuleOptions {
  ignore?: InputOption | InputOption[];
  only?: InputOption | InputOption[];
}

type InputOption =
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
```

### The `ignore` Option

This is the primary filter used to specify exceptions or conditions for which attributes should not be reported. Attributes matching its conditions are excluded from being reported.

### The `only` Option

This is a less commonly used option. If specified, only attributes matching its conditions will be considered. If omitted, all attributes are initially selected. If the `only` option is present with `ignore`, the `only` option will determine which attributes to consider and then the `ignore` option is used to ignore any attributes that match.

### Logical Conditions in `InputOption`

Three logical operators aid in crafting your criteria:

- **OR (`or`)**: Any condition within the `or` block being true makes the entire block true.
- **AND (`and`)**: All conditions within the `and` block must be true for the entire block to be true.
- **NOT (`not`)**: Inverts the result of its condition.

When multiple keys are present in the input object, they follow the "OR" logic. If you desire an "AND" relationship, use the `and` condition explicitly. For example, to enforce that an attribute must be from the `Button` component AND named 'as', you'd use:

```json
{
  "and": [{ "components": ["Button"] }, { "attributes": ["as"] }]
}
```

## Examples

### **1. Ensuring Localization**

A common scenario in internationalized applications is to ensure strings are localized. By default, you might want to flag all string literals within JSX attributes to remind developers to use localized strings.

**ESLint Config:**

```json
{
  "rules": {
    "no-attribute-string-literals/no-attribute-string-literals": "error"
  }
}
```

**Invalid Code:**

```jsx
<Header title="Welcome" />
```

**Valid Code:**

```jsx
<Header title={t('welcome_message')} />
```

### **2. Allowing Specific Data Attributes**

For automated testing, `data-testid` attributes are commonly used. While you might want to localize most string literals, this is an exception.

**ESLint Config:**

```json
{
  "rules": {
    "no-attribute-string-literals/no-attribute-string-literals": [
      "error",
      {
        "ignore": {
          "attributes": ["data-testid"]
        }
      }
    ]
  }
}
```

**Valid Code:**

```jsx
<Button data-testid="submit-button" />
```

### **3. Special Case for Specific Components**

Imagine you have certain components where some attributes are always expected to have string literals. For instance, you have a `<RouterLink>` component where the `to` attribute specifies a route.

**ESLint Config:**

```json
{
  "rules": {
    "no-attribute-string-literals/no-attribute-string-literals": [
      "error",
      {
        "ignore": {
          "and": [{ "components": ["RouterLink"] }, { "attributes": ["to"] }]
        }
      }
    ]
  }
}
```

**Valid Code:**

```jsx
<RouterLink to="/dashboard" />
```

### **4. Allowing Specific Attribute Values**

There might be scenarios where you want to allow specific string values for an attribute. For instance, you have a `<ThemeSwitch>` component where the `mode` attribute can only be "dark" or "light".

**ESLint Config:**

```json
{
  "rules": {
    "no-attribute-string-literals/no-attribute-string-literals": [
      "error",
      {
        "ignore": {
          "and": [
            { "components": ["ThemeSwitch"] },
            { "values": ["dark", "light"] }
          ]
        }
      }
    ]
  }
}
```

**Valid Code:**

```jsx
<ThemeSwitch mode="dark" />
```

### **5. Pattern Matching for Component Names**

You may have a set of components following a naming pattern, and you want to ensure certain attributes for all those components have string literals. For instance, any component with "Form" in its name should be allowed to have a `placeholder` attribute.

**ESLint Config:**

```json
{
  "rules": {
    "no-attribute-string-literals/no-attribute-string-literals": [
      "error",
      {
        "ignore": {
          "and": [
            { "componentPatterns": [".*Form$"] },
            { "attributes": ["placeholder"] }
          ]
        }
      }
    ]
  }
}
```

**Valid Code:**

```jsx
<TextInputForm placeholder="Enter your name" />
<DateInputForm placeholder="Select a date" />
```
