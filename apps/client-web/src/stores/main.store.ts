import { defineStore } from 'pinia';

import { ref } from 'vue';
import { Quasar } from 'quasar';
import i18n, { LangCode } from '../locales/i18n';

export const useMainStore = defineStore('main', () => {
  const locale = i18n.global.locale as unknown as `${LangCode}`;

  const data = ref('codfish');
  const lang = ref(locale);

  async function setLang(value: `${LangCode}`) {
    lang.value = value;
  }

  return {
    data,
    lang,
    setLang,
  }
})