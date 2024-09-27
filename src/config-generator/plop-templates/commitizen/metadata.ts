import type { Actions } from 'node-plop'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { $dir } from '@/utils/path'
import { $ } from 'execa'
import { defineMetadata } from '../../utils/template'

export default defineMetadata({
  name: 'commitizen',
  description: 'Commitizen configuration.',
  prompts: [
    {
      type: 'list',
      name: 'adaptor',
      message: 'Select adaptor:',
      choices: [
        { checked: true, value: 'git-cz', name: 'git-cz' },
        { value: 'cz-git', name: 'cz-git' },
        { value: 'cz-conventional-changelog', name: 'cz-conventional-changelog' },
      ],
      default: 'git-cz',
    },
  ],
  deps: (answers) => ['commitizen', answers.adaptor],
  actions: (data) => {
    data.czGit = data.adaptor === 'cz-git'
    data.gitCz = data.adaptor === 'git-cz'

    $({ stdio: 'inherit' }).sync`npm pkg set scripts.cz=cz`

    const actions: Actions = [
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'adaptor.hbs'),
        path: resolve(cwd(), '.czrc'),
        data,
        force: true,
      },
    ]
    switch (data.adaptor) {
      case 'git-cz':
      case 'cz-git':
        actions.push({
          type: 'add',
          templateFile: resolve($dir(__dirname), '{{adaptor}}.hbs'),
          path: resolve(cwd(), 'cz.config.cjs'),
          data,
        })
        break
    }
    // git-cz 必须通过 changelog.config.cjs 才可自定义配置
    if (data.gitCz) {
      actions.push({
        type: 'add',
        templateFile: resolve($dir(__dirname), 'changelog.hbs'),
        path: resolve(cwd(), 'changelog.config.cjs'),
        data,
      })
    }
    return actions
  },
})
