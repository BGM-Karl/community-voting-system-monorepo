import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'

  const legacyTargets = isBuild
    ? ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15']
    : undefined

  const stage = mode === 'staging' ? '/_stage' : ''
  const base = isBuild ? `${stage}/_admin/` : '/'
  // const base = '/'

  return {
    base,
    optimizeDeps: {
      exclude: ['type-fest', '@community-voting-system/shared'],
    },
    css: {
      preprocessorOptions: {
        // FIX: 會導致 [sass] Can't find stylesheet to import.，待確認原因
        // sass: {
        //   api: 'modern-compiler', // or "modern"
        // },
      },
    },
    plugins: [
      VueRouter({
        // 忽略 _ 開頭的檔案
        filePatterns: ['**/*', '!**/_*'],
      }),
      // VueDevTools(),
      vue({
        template: { transformAssetUrls },
      }),
      // VueI18nPlugin({
      //   include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
      // }),

      quasar({
        sassVariables: 'src/style/quasar-variables.sass',
      }),

      Unocss(),

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
        '/api': {
          target: 'http://localhost:8080',
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
