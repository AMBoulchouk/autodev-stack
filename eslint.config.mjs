import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:frontend',
              onlyDependOnLibsWithTags: [
                'type:contracts',
                'type:domain',
                'type:ui',
                'type:config',
              ],
            },
            {
              sourceTag: 'type:backend',
              onlyDependOnLibsWithTags: [
                'type:contracts',
                'type:domain',
                'type:data-access',
                'type:config',
              ],
            },
            {
              sourceTag: 'type:orchestrator',
              onlyDependOnLibsWithTags: [
                'type:contracts',
                'type:domain',
                'type:config',
              ],
            },
            {
              sourceTag: 'scope:platform',
              onlyDependOnLibsWithTags: ['scope:platform', 'scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
