import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@common': fileURLToPath(new URL('../common/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['projects/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: [
        'projects/menu/src/app/features/menu/components/cart/cart.ts',
        'projects/menu/src/app/features/menu/components/price-dialog/price-dialog.ts',
        'projects/menu/src/app/features/menu/pages/menu.ts',
        'projects/menu/src/app/features/menu/store/cart-calculations.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 60,
        branches: 50,
        statements: 70,
      },
    },
  },
});
