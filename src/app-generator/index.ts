import { cwd } from 'node:process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from 'fs-extra'
import { red } from 'kolorist'
import { rimrafSync } from 'rimraf'
import { installPackage } from '@antfu/install-pkg'
import { isObject, isString } from 'lodash-es'
import { execaSync } from 'execa'
import type { GeneratorModule } from '@/types/generator-module'
import { requiredValidator } from '@/utils/prompt'
import type { Recordable } from '@/types/utils'
import { $dir } from '@/utils/path'
import { execaOpts } from '@/utils/execa'

export interface AppGeneratorOptions {
  /**
   * 清单配置或文件地址
   * @example
   * ```ts
   * const options = {
   *   // 配置
   *   manifest: {
   *     // options
   *   }
   * }
   *
   * const options = {
   *   // 地址
   *   manifest: './manifest.js'
   * }
   * ```
   *
   */
  manifest?: string | AppGeneratorManifest
}

export interface AppGeneratorManifest {
  /**
   * 包管理器
   * @default 'pnpm'
   */
  packageManager?: string
  /**
   * 安装时的额外参数
   */
  additionalArgs?: string[]
  /**
   * package.json 需要添加的脚本
   *
   * @example
   * ```ts
   * {
   *   dev: 'dev',
   *   build: 'build'
   * }
   * ```
   */
  scripts?: Recordable<string>
  /**
   * 需要清理的文件或文件夹列表，不支持 * 匹配，但支持 ! 忽略。
   * @default []
   *
   * @example
   * ```ts
   * ['dist', '!dist/ignore.ts']
   * ```
   */
  removeFiles?: string[]
  /**
   * 构建时的依赖列表
   * @default []
   *
   * @example
   * ```ts
   * ['dep1', 'dep2@4']
   * ```
   */
  dependencies?: string[]
  /**
   * 开发时的依赖列表
   * @default []
   *
   * @example
   * ```ts
   * ['dep1', 'dep2@4']
   * ```
   */
  devDependencies?: string[]
}

function resolveManifestPath(value: string) {
  return resolve(cwd(), value)
}

function tryImportManifest(path: string) {
  return new Promise<AppGeneratorManifest>((resolve, reject) => {
    import(pathToFileURL(path).href)
      .then((res) => {
        if (isObject(res?.default)) resolve(res.default)
        else reject(new Error('Manifest must be an object!'))
      })
      .catch((e) => {
        reject(e)
      })
  })
}

const setup: GeneratorModule<AppGeneratorOptions> = (plop, options) => {
  let manifest: AppGeneratorManifest | null = null
  let promise: Promise<AppGeneratorManifest> | null = null

  if (options?.manifest) {
    if (isObject(options.manifest)) {
      manifest = options.manifest!
    }
    else if (isString(options.manifest)) {
      const path = resolveManifestPath(options.manifest)
      if (fs.existsSync(path)) promise = tryImportManifest(path)
    }
  }

  plop.setGenerator('app-generator', {
    description: 'Update dependencies and cleanup invalid files.',
    prompts: [
      {
        name: 'path',
        message: 'Manifest path:',
        type: 'input',
        default: 'app-manifest.js',
        when: async () => {
          try {
            manifest = await promise
          }
          catch (e) {}
          return manifest === null
        },
        validate: async (value) => {
          const valid = requiredValidator(value)
          if (valid !== true) return valid

          const path = resolveManifestPath(value)
          const isExists = fs.existsSync(path)
          let msg: boolean | string = true

          if (isExists) {
            try {
              manifest = await tryImportManifest(path)
            }
            catch (e: unknown) {
              msg = red((e as Error).message)
            }
          }
          else {
            msg = red(`Does not exist "${path}"!`)
          }

          return msg
        },
      },
      {
        name: 'initRepo',
        type: 'confirm',
        message: 'Initialize git repository?',
        default: true,
      },
    ],
    actions: (answers = {}) => {
      if (!manifest) return []

      const { removeFiles = [], dependencies = [], devDependencies = [] } = manifest

      // cleanup invalid files
      if (removeFiles.length) rimrafSync(removeFiles, { glob: { cwd: cwd() } })

      // initialize git repository
      answers.initRepo && execaSync('git', ['init'], execaOpts)

      // install dependencies
      if (dependencies.length || devDependencies.length) {
        const { packageManager = 'pnpm', additionalArgs } = manifest

        Promise.resolve()
          .finally(() => installDependencies(devDependencies, true))
          .finally(() => installDependencies(dependencies, false))

        function installDependencies(dependencies: string[], dev: boolean) {
          return installPackage(dependencies, { cwd: cwd(), dev, packageManager, additionalArgs })
        }
      }

      return [
        {
          type: 'add',
          templateFile: resolve($dir(__dirname), 'package.hbs'),
          path: resolve(cwd(), 'package.json'),
          force: true,
          data: manifest,
        },
      ]
    },
  })
}

export default setup
