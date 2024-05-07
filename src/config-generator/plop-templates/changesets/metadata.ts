import { cwd } from 'node:process'
import { resolve } from 'node:path'
import { $ } from 'execa'
import { defineMetadata } from '../../utils/template'
import { $dir } from '@/utils/path'

export default defineMetadata({
  name: 'changesets',
  description: 'Changesets configuration.',
  prompts: [
    {
      type: 'confirm',
      name: 'build',
      message: 'Needs to build?',
      default: true,
      when: () => $.sync`npm pkg get scripts.build`.stdout === '{}',
    },
  ],
  deps: ['@changesets/cli', 'npm-run-all'],
  processAnswer(data) {
    data.build ??= true
  },
  actions: (data) => {
    const $cwd = $({ stdio: 'inherit' }).sync

    data.build && set('scripts.build', 'build')
    set('scripts.change', 'changeset')
    set('scripts.change:version', 'changeset version')
    set('scripts.change:publish', 'changeset publish')
    set('scripts.release', `run-s ${data.build ? 'build ' : ''}change:version change:publish`)

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
        path: resolve(cwd(), '.changeset/config.json'),
        skipIfExists: true,
      },
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'readme.hbs'),
        path: resolve(cwd(), '.changeset/README.md'),
        skipIfExists: true,
      },
    ]
  },
})
