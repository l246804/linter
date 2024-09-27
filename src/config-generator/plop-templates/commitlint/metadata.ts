import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { execaOpts } from '@/utils/execa'
import logger from '@/utils/logger'
import { $dir } from '@/utils/path'
import { execa } from 'execa'
import fs from 'fs-extra'
import { loadPackageJSON } from 'local-pkg'
import { defineMetadata } from '../../utils/template'

export default defineMetadata({
  name: 'commitlint',
  description: 'Commitlint configuration.',
  deps: ['husky', '@commitlint/cli', '@commitlint/types', '@commitlint/config-conventional'],
  prompts: [
    {
      type: 'confirm',
      name: 'commitizen',
      message: 'Commitizen?',
      default: true,
    },
  ],
  onInstalled: () => {
    return Promise.resolve()
      .then(() => execa('git', ['init'], execaOpts).catch(() => {}))
      .then(() => execa('husky', execaOpts))
      .then(async () => {
        // 读取 package.json
        const { scripts = {} } = (await loadPackageJSON(cwd())) || {}
        let prepare = scripts.prepare || ''

        // 没有 husky 时追加命令
        if (!prepare.includes('husky')) {
          prepare = prepare ? `husky && ${prepare}` : 'husky'
          execa(`npm pkg set scripts.prepare="${prepare}"`, execaOpts)
        }

        if (fs.existsSync(resolve(cwd(), '.husky'))) {
          fs.writeFileSync(
            resolve(cwd(), '.husky', 'commit-msg'),
            'npx --no -- commitlint --edit $1',
            { encoding: 'utf-8' },
          )
        }
        else {
          logger.warn('Husky initial failed!')
        }
      })
  },
  actions: (answers) => {
    const data = {
      hasCzConfig: false,
      enums: '',
      maxHeaderLength: '',
    }

    const czrcFile = resolve(cwd(), '.czrc')
    const pkgFile = resolve(cwd(), 'package.json')
    const hasCzrc = fs.existsSync(czrcFile)

    if (answers.commitizen && (hasCzrc || fs.existsSync(pkgFile))) {
      const file = hasCzrc ? czrcFile : pkgFile
      const errorFile = hasCzrc ? '.czrc' : 'package.json:commitizen'
      const json = fs.readFileSync(file, { encoding: 'utf-8' })

      try {
        const obj = JSON.parse(json) || {}
        const path = obj.path || obj.commitizen?.path || ''
        if (!path)
          throw new Error(`The path in "${errorFile}" must exist!`)
        if (path.includes('git-cz')) {
          data.enums = 'list'
          data.maxHeaderLength = 'maxMessageLength'
        }
        else if (path.includes('cz-git')) {
          data.enums = 'type.map(({ value }) => value)'
          data.maxHeaderLength = 'maxHeaderLength'
        }
        data.hasCzConfig = !!data.enums
      }
      catch {
        logger.warn(`Parsing "${errorFile}" failed!`)
      }
    }

    return [
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'default.hbs'),
        path: resolve(cwd(), 'commitlint.config.cjs'),
        data,
      },
    ]
  },
})
