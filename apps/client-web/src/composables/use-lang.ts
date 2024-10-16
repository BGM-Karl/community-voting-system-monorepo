import { MessageSchema, LangCode } from '../locales/i18n';

import { useI18n } from 'vue-i18n';

export function useLang() {
  return useI18n<{ message: MessageSchema }, `${LangCode}`>()
}