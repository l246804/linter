import { installPackage } from '@antfu/install-pkg'
import { uniq } from 'lodash-es'
import { getTemplateAnswers, getTemplatePrompts, getTemplateTypes } from './utils/template'
import type { TemplateMetadata } from './types/template'
import { mapDeps } from './utils/deps'
import { ensureFunction } from '@/utils/fn'
import logger from '@/utils/logger'
import type { GeneratorModule } from '@/types/generator-module'

export interface ConfigGeneratorOptions {
  /**
   * 是否自动安装依赖
   * @default false
   */
  autoInstall?: boolean
  /**
   * 自动安装依赖时的可选参数
   */
  additionalArgs?: string[]
}

const setup: GeneratorModule<ConfigGeneratorOptions> = (plop, options) => {
  const templates = Object.values(
    import.meta.glob<TemplateMetadata>('./plop-templates/**/metadata.ts', {
      import: 'default',
      eager: true,
    }),
  )

  if (templates.length === 0)
    return logger.warn('No templates found.')

  plop.setGenerator('config-generator', {
    description: 'Generate configuration file.',
    prompts: [
      {
        name: 'type',
        message: 'Select template configuration type:',
        type: 'list',
        choices: getTemplateTypes(templates),
      },
      ...getTemplatePrompts(templates),
      {
        name: 'autoInstall',
        message: 'Automatically install dependencies?',
        type: 'confirm',
        default: false,
        when: (answers) => {
          // 如果配置项里设置了该属性，则直接跳过
          if (typeof options?.autoInstall !== 'undefined')
            return false

          const template = templates.find(({ name }) => name === answers.type)!
          if (!template.deps)
            return false

          const data = getTemplateAnswers(answers.type, answers)
          return ensureFunction(template.deps)(data).length > 0
        },
      },
    ],
    actions: (answers = {}) => {
      const { type } = answers
      const metadata = templates.find(({ name }) => name === type)
      if (!metadata)
        return []

      const data = getTemplateAnswers(type, answers)
      metadata.processAnswer?.(data)

      const autoInstall
        = typeof options?.autoInstall !== 'undefined' ? options.autoInstall : answers.autoInstall
      const deps = (ensureFunction(metadata.deps)(data) || []).filter(Boolean)

      const actions = ensureFunction(metadata.actions)(data) || []

      if (autoInstall && deps.length > 0) {
        installPackage(mapDeps(deps), {
          dev: true,
          additionalArgs: uniq([
            ...(metadata.additionalArgs || []),
            ...(options?.additionalArgs || []),
          ]),
        }).then(() => metadata.onInstalled?.(data))
      }

      return actions
    },
  })
}

export default setup
