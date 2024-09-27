import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { $dir } from '@/utils/path'
import { defineMetadata } from '../../utils/template'

export default defineMetadata({
  name: 'prettier',
  description: 'Prettier configuration.',
  deps: ['prettier'],
  actions: [
    {
      type: 'add',
      templateFile: resolve($dir(__dirname), 'default.hbs'),
      path: resolve(cwd(), '.prettierrc'),
    },
  ],
})
