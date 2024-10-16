import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'btn': 'px-4 py-1 rounded bg-red text-white cursor-pointer'
    },
    [/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`],
  ],
  rules: [],
  presets: [
    presetUno(),
  ],
})