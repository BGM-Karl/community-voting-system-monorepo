import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

import VueDevTools from 'vite-plugin-vue-devtools'

import removeConsole from 'vite-plugin-remove-console';
import legacy from '@vitejs/plugin-legacy';

import vueI18n from '@intlify/vite-plugin-vue-i18n';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'url';

import Unocss from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const base = isBuild ? `/web/` : '/'

  const legacyTargets = isBuild ? [
    'Android > 39',
    'Chrome >= 60',
    'Safari >= 10.1',
    'iOS >= 10.3',
    'Firefox >= 54',
    'Edge >= 15'
  ] : undefined;

  return {
    base,
    plugins: [
      VueDevTools(),
      vue({
        template: { transformAssetUrls }
      }),
      vueI18n({
        include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
      }),

      quasar({
        sassVariables: 'src/style/quasar-variables.sass'
      }),

      // Unocss(),

      removeConsole(),
      legacy({ targets: legacyTargets }),
    ],
    test: {
      environment: 'happy-dom',
      coverage: {
        reporter: ['html'],
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['../../'],
      },
    },
  }
})