import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: [
        'src/index.ts',
        'src/react/index.ts',
        'src/providers/mixpanel/index.ts',
        'src/providers/ga3/index.ts',
        'src/providers/custom/index.ts',
      ],
      formats: ['cjs', 'es'],
      fileName(format, entryName) {
        const ext = format === 'es' ? 'js' : 'cjs';

        return [entryName, ext].join('.');
      },
    },
    outDir: 'dist',
    rollupOptions: {
      external: id => {
        return !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/');
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts(),
  ],
});
