import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { $dir } from '@/utils/path'
import { defineMetadata } from '../../utils/template'

export default defineMetadata({
  name: 'tsconfig',
  description: 'Typescript configuration.',
  deps: (answers) => ['typescript', answers.node && '@types/node'],
  prompts: [
    {
      name: 'node',
      type: 'confirm',
      message: 'Node?',
      default: false,
    },
  ],
  actions: (data) => [
    {
      type: 'add',
      templateFile: resolve($dir(__dirname), 'default.hbs'),
      path: resolve(cwd(), 'tsconfig.json'),
      data,
    },
  ],
})
