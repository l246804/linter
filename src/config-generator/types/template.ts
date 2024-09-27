import type { Fn, Recordable } from '@/types/utils'
import type { ActionType, PromptQuestion } from 'node-plop'

export interface TemplateMetadata {
  name: string
  description?: string
  deps?: string[] | Fn<[any], string[]>
  additionalArgs?: string[]
  prompts?: PromptQuestion[]
  actions?: ((data: Recordable) => ActionType[]) | ActionType[]
  processAnswer?: (data: Recordable) => void

  onInstalled?: Fn<[any]>
}
