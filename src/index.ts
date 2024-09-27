import type { NodePlopAPI } from 'node-plop'
import type { GeneratorModule } from './types/generator-module'
import type { Recordable } from './types/utils'
import { camelCase } from 'lodash-es'

export * from './generators'

const generators = import.meta.glob<GeneratorModule>('./*-generator/index.ts', {
  eager: true,
  import: 'default',
})

export function setupGenerators(plop: NodePlopAPI, options: Recordable<Recordable> = {}) {
  Object.entries(generators).forEach(([key, fn]) => {
    fn(plop, options?.[camelCase(key.split('/').find((v) => v.endsWith('generator')))] || {})
  })
}
