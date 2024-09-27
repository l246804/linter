import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { $dir } from '@/utils/path'
import { isPackageExists } from 'local-pkg'
import { defineMetadata } from '../../utils/template'

export default defineMetadata({
  name: 'vscode',
  description: 'VSCode configuration.',
  prompts: [
    {
      name: 'purpose',
      type: 'list',
      message: 'Select template purpose:',
      choices: [{ name: 'Frontend configuration.', value: 'frontend' }],
    },
    {
      name: 'vue',
      type: 'confirm',
      message: 'Vue?',
      default: false,
      when: (answers) => answers.purpose === 'frontend' && !isPackageExists('vue'),
    },
  ],
  processAnswer: (data) => {
    data.vue ??= isPackageExists('vue')
  },
  actions: (answers) => {
    const data = {
      ...answers,
      vue: !!answers.vue,
    }
    return [
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), '{{purpose}}/extensions.hbs'),
        path: resolve(cwd(), '.vscode/extensions.json'),
        data,
        skipIfExists: true,
      },
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), '{{purpose}}/global.code-snippets.hbs'),
        path: resolve(cwd(), '.vscode/global.code-snippets'),
        data,
        skipIfExists: true,
      },
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), '{{purpose}}/settings.hbs'),
        path: resolve(cwd(), '.vscode/settings.json'),
        data,
      },
    ]
  },
})
