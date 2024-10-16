import { createApp } from 'vue';
import router from './router/router';
import { createPinia } from 'pinia';
import i18n from './locales/i18n';

import {
  Quasar, Notify, Dialog, Loading, QuasarPluginOptions
} from 'quasar';
import quasarLang from 'quasar/lang/zh-TW';

// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';

// Import Quasar css
import 'quasar/src/css/index.sass';
import App from './App.vue';

// Tailwind CSS
import './index.css';

// Uno CSS
// import 'uno.css';

// 自訂樣式
import './style/animate.sass';
import './style/global.sass';


createApp(App)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .use((Quasar as any), {
    plugins: {
      Notify, Dialog, Loading,
    },
    lang: quasarLang,
  } as QuasarPluginOptions)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .mount('#app')

