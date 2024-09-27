import type { NodePlopAPI, PromptQuestion } from 'node-plop'
import { sep } from 'node:path'
import { cwd } from 'node:process'
import FileTreeSelectionPrompt from 'inquirer-file-tree-selection-prompt'
import { gray } from 'kolorist'

type QuestionOptions = Partial<FileTreeSelectionPrompt['opt']>

const key = 'file-tree-selection'

export function setupFileTreeSelectionPrompt(plop: NodePlopAPI) {
  plop.setPrompt(key, FileTreeSelectionPrompt)
}

export function createFileTreeSelectionPrompt(opts: QuestionOptions): PromptQuestion {
  return {
    onlyShowDir: true,
    transformer(input) {
      if (input === cwd())
        return '.(current directory)'
      const name = input.split(sep).pop()
      if (name[0] === '.' || name === 'node_modules')
        return gray(name)
      return name
    },
    ...opts,
    type: key,
  } as QuestionOptions
}
