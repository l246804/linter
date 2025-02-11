import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { $dir } from '@/utils/path'
import { isPackageExists } from 'local-pkg'
import { defineMetadata } from '../../utils/template'

export default defineMetadata({
  name: 'vite',
  description: 'Vite configuration.',
  prompts: [
    {
      type: 'confirm',
      name: 'umd',
      message: 'Needs umd of format?',
      default: false,
    },
    {
      name: 'vue',
      type: 'confirm',
      message: 'Vue?',
      default: false,
      when: () => !isPackageExists('vue'),
    },
    {
      type: 'confirm',
      name: 'dts',
      message: 'Dts?',
      default: false,
    },
  ],
  processAnswer(data) {
    data.vue ??= true
  },
  deps: (answers) => [
    'vite',
    answers.dts && 'vite-plugin-dts',
    'typescript',
    'rollup',
    'fast-glob',
    ...(answers.vue ? ['@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx'] : []),
  ],
  actions: (data) => {
    return [
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'default.hbs'),
        path: resolve(cwd(), 'vite.config.ts'),
        data,
      },
    ]
  },
})
