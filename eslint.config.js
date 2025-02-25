import planetReactConfig from 'eslint-config-planet/react.js';

export default [
  {
    ignores: ['node_modules', 'test-results', 'site/.astro', 'site/dist'],
  },
  ...planetReactConfig,
  {
    rules: {
      'react/prop-types': 'off',
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            'astro:content',
            'astro/config',
            '@astrojs/*',
            '@octokit/rest',
            'virtual:*',
          ],
        },
      ],
    },
  },
];
