import { globbySync } from 'globby';
import { defineConfig, mergeConfig } from 'vite';
import { baseConfig } from './vite.config.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: {
        entry: globbySync('./src/providers/*.ts'),
        fileName(format, entryName) {
          const isEntry = entryName.includes('/') === false;
          const [providerName] = entryName.split('/');
          const ext = format === 'es' ? 'mjs' : 'cjs';

          return isEntry
            ? [entryName, ext].join('.')
            : `${providerName}/dist/${[entryName, ext].join('.')}`;
        },
      },
      outDir: 'providers',
    },
  }),
);
