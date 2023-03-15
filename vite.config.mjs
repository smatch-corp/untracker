import { mergeConfig } from 'vite';
import { defineConfig } from 'vite';

export const baseConfig = defineConfig({
  build: {
    lib: {
      formats: ['cjs', 'es'],
      fileName(format, entryName) {
        const ext = format === 'es' ? 'mjs' : 'cjs';

        return [entryName, ext].join('.');
      },
    },
    rollupOptions: {
      external: (id) => {
        return (
          !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/')
        );
      },
      output: {
        preserveModules: true,
      },
    },
    emptyOutDir: false,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: { entry: 'src/core/index.ts' },
      outDir: 'core',
    },
  }),
);
