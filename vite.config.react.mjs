import { mergeConfig } from 'vite';
import { defineConfig } from 'vite';
import { baseConfig } from './vite.config.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: { entry: 'src/react/index.ts' },
      outDir: 'react',
    },
  }),
);
