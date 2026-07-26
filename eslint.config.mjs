import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['browser', 'node'],
    ignores: [
      'coverage/**',
      'dist/**'
    ]
  }),

  {
    files: ['index.mjs'],
    languageOptions: {
      ecmaVersion: 2015
    }
  },

  {
    rules: {
      camelcase: 'off',
    }
  }
]
