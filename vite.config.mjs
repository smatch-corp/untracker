import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: [
        'src/core/index.ts',
        'src/react/index.ts',
        'src/providers/mixpanel/index.ts',
        'src/providers/ga4/index.ts',
      ],
      formats: ['cjs', 'es'],
      fileName(format, entryName) {
        const ext = format === 'es' ? 'js' : 'cjs';

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
    environment: 'happy-dom',
  },
});
