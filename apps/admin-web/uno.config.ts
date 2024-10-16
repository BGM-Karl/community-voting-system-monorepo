import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'fit': 'w-full h-full',
      'flex-col': 'flex flex-col',
      'flex-center': 'flex justify-center items-center',
      'border': 'border-solid border-1 border-[#F1F1F1]',
      'border-t': 'border-t-solid border-t-1 border-[#F1F1F1]',
    },
    [/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`],
  ],
  rules: [],
  presets: [
    presetUno(),
  ],
})