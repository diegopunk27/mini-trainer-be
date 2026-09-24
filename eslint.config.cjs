const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = (async () => {
  const stylistic = (await import('@stylistic/eslint-plugin')).default;
  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic,
    {
      files: ['**/*.ts'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: './tsconfig.json',
          sourceType: 'module',
        },
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        stylistic: stylistic,
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-confusing-void-expression': 'error',
        '@typescript-eslint/no-mixed-enums': 'error',
        '@typescript-eslint/prefer-function-type': 'off',
        '@typescript-eslint/prefer-literal-enum-member': 'error',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: ['UPPER_CASE', 'camelCase'],
          },
          {
            selector: 'variable',
            types: ['function'],
            format: ['UPPER_CASE', 'camelCase', 'PascalCase'],
          },
          {
            selector: ['function', 'classMethod', 'classProperty'],
            format: ['camelCase', 'PascalCase'],
          },
          {
            selector: 'parameter',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
          },
          {
            selector: ['class', 'interface'],
            format: ['PascalCase'],
          },
        ],
        '@typescript-eslint/no-empty-object-type': 'off',
        'stylistic/indent': ['error', 2],
        'stylistic/quotes': ['error', 'single'],
        'stylistic/semi': ['error', 'always'],
        'stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
        'stylistic/object-curly-spacing': ['error', 'always'],
        'stylistic/array-bracket-spacing': ['error', 'never'],
      },
    },
    {
      ignores: [
        'dist/**',
        'node_modules/**',
        'mcp-servers/**',
        'eslint.config.cjs',
        'jest.config.js',
        'jest.e2e.config.js',
        'naming-checker.mjs',
        'tests-scripts/**',
      ],
    },
  );
})();
