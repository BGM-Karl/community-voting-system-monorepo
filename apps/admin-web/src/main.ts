import type { QuasarPluginOptions } from 'quasar'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

// import i18n from './locales/i18n';
import { VueQueryPlugin } from '@tanstack/vue-query'
import dayjs from 'dayjs'
import {
  Dialog,
  Loading,
  Meta,
  Notify,
  Quasar,
} from 'quasar'

import iconSet from 'quasar/icon-set/material-symbols-rounded'
// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css'

import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Tailwind CSS
// import './index.css';

import { createRouter, createWebHistory } from 'vue-router/auto'

import { routes } from 'vue-router/auto-routes'
import App from './App.vue'

// Uno CSS
import 'virtual:uno.css'
import './style/animate.sass'
import './style/global.sass'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

createApp(App)
  .use(Quasar, {
    plugins: {
      Notify,
      Dialog,
      Loading,
      Meta,
    },
    iconSet,
  } as QuasarPluginOptions)
  .use(createPinia())
  .use(router)
  .use(VueQueryPlugin)
  // .use(i18n)
  .mount('#app')
