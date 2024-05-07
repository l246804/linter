import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { $ } from 'execa'
import { defineMetadata } from '../../utils/template'
import { $dir } from '@/utils/path'

export default defineMetadata({
  name: 'release-it',
  description: 'Release-It configuration.',
  prompts: [
    {
      type: 'confirm',
      name: 'changelog',
      message: 'Changelog?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'build',
      message: 'Needs to build?',
      default: true,
      when: () => $.sync`npm pkg get scripts.build`.stdout === '{}',
    },
  ],
  processAnswer(data) {
    data.build ??= true
  },
  deps: (answers) => [
    'release-it',
    answers.changelog && '@release-it/conventional-changelog',
  ],
  actions: (data) => {
    const $cwd = $({ stdio: 'inherit' }).sync

    data.build && set('scripts.build', 'build')
    set('scripts.release', 'release-it')

    function set(key: string, value?: any) {
      if (value == null)
        return

      const isString = typeof value === 'string'
      const args = ([] as string[]).concat(isString ? [] : '--json')
      value = isString ? value : JSON.stringify(value)

      $cwd`npm pkg set ${[`${key}=${value}`, ...args]}`
    }

    return [
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'default.hbs'),
        path: resolve(cwd(), '.release-it.json'),
        data,
      },
    ]
  },
})
