
import { createI18n } from 'vue-i18n';
import messages from '@intlify/vite-plugin-vue-i18n/messages';

import zhTW from './langs/zh-TW.json';

export type MessageSchema = typeof zhTW;
export enum LangCode {
  ZH_TW = 'zh-TW',
  EN_US = 'en-US',
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages
})

export default i18n;
