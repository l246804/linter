import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { kebabCase } from 'lodash-es'
import { $ } from 'execa'
import { defineMetadata } from '../../utils/template'
import { $dir } from '@/utils/path'
import { requiredValidator } from '@/utils/prompt'

export default defineMetadata({
  name: 'package',
  description: 'Package configuration.',
  prompts: [
    {
      type: 'input',
      name: 'account',
      message: 'Github account:',
      validate: requiredValidator,
    },
    {
      type: 'input',
      name: 'username',
      message: 'Username:',
      validate: requiredValidator,
    },
    {
      type: 'confirm',
      name: 'scope',
      message: 'Scope?',
      default: true,
    },
    {
      type: 'input',
      name: 'scopeName',
      message: 'Scope name?',
      when: (answers) => answers.scope,
      validate: requiredValidator,
    },
    {
      type: 'input',
      name: 'name',
      message: 'Package name:',
      validate: requiredValidator,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Package description:',
    },
  ],
  processAnswer: (data) => {
    data.year = new Date().getFullYear()
    if (data.scope)
      data.scopeName = kebabCase(data.scopeName)
    data.name = kebabCase(data.name)
  },
  actions: (data) => {
    const $cwd = $({ stdio: 'inherit' }).sync

    set('name', `${data.scope ? `@${data.scopeName}/` : ''}${data.name}`)

    set('type', 'module')

    set('version', '0.0.0')

    set('description', data.description)

    set('author', `${data.username} <https://github.com/${data.account}>`)

    set('license', 'MIT')

    set('homepage', `https://github.com/${data.account}/${data.name}`)

    set('repository', {
      type: 'git',
      url: `https://github.com/${data.account}/${data.name}`,
    })

    set('bugs', {
      url: `https://github.com/${data.account}/${data.name}/issues`,
    })

    set('keywords', [])

    set('publishConfig', {
      access: 'public',
    })

    set('exports', {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs',
      },
      './*': './*',
    })

    set('main', './dist/index.cjs')

    set('module', './dist/index.js')

    set('types', './dist/index.d.ts')

    set('files', [
      'CHANGELOG.md',
      'README.md',
      'dist',
    ])

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
        templateFile: resolve($dir(__dirname), 'license.hbs'),
        path: resolve(cwd(), 'LICENSE'),
        data,
        skipIfExists: true,
      },
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'gitignore.hbs'),
        path: resolve(cwd(), '.gitignore'),
        data,
        skipIfExists: true,
      },
    ]
  },
})
