import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { $dir } from '@/utils/path'
import { isPackageExists } from 'local-pkg'
import { defineMetadata } from '../../utils/template'

export default defineMetadata({
  name: 'eslint',
  description: 'ESLint configuration.',
  deps: (answers) => [
    'eslint',
    '@antfu/eslint-config',
    answers.vue && 'eslint-plugin-format',
  ],
  prompts: [
    {
      name: 'vue',
      type: 'confirm',
      message: 'Vue?',
      default: false,
      when: () => !isPackageExists('vue'),
    },
  ],
  processAnswer: (data) => {
    data.vue ??= true
  },
  actions: (data) => {
    return [
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'default.hbs'),
        path: resolve(cwd(), 'eslint.config.js'),
        data,
      },
    ]
  },
})
