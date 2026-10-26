import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      '.standards/**',
      'node_modules/**',
      'data/**',
      'next-env.d.ts',
      'web/content/data/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      complexity: ['error', 6],
      'prefer-const': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
