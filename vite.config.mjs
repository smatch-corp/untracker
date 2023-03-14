import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: [
        'src/core/index.ts',
        'src/react/index.ts',
        'src/providers/ga4.ts',
        'src/providers/hackle-react.ts',
        'src/providers/mixpanel.ts',
      ],
      formats: ['cjs', 'es'],
      fileName(format, entryName) {
        const ext = format === 'es' ? 'mjs' : 'cjs';

        return [entryName, ext].join('.');
      },
    },
    outDir: 'dist',
    rollupOptions: {
      external: (id) => {
        return (
          !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/')
        );
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});
