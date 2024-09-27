import type { PromptQuestion } from 'node-plop'
import type { TemplateMetadata } from '../types/template'
import { isBoolean, isFunction } from 'lodash-es'

export function defineMetadata(metaData: TemplateMetadata) {
  return metaData
}

export function getTemplateTypes(metadata: TemplateMetadata[]) {
  return metadata.map(({ name, description }) => ({ name: description || name, value: name }))
}

export function getTemplatePrompts(metadata: TemplateMetadata[]) {
  return metadata.reduce(
    (arr, item) =>
      arr.concat(
        (item.prompts || []).map((_item) => ({
          ..._item,
          name: `${item.name}.${_item.name}`,
          when: async (answer) => {
            // 只有选中当前模板时才出现该问题
            let valid = answer.type === item.name

            // 如果选中当前模板且模板问题存在 `when` 时进行验证
            if (valid && _item.when != null) {
              valid = isBoolean(_item.when)
                ? _item.when
                : isFunction(_item.when)
                  ? await _item.when(getTemplateAnswers(answer.type, answer))
                  : valid
            }

            return valid
          },
        })),
      ),
    [] as PromptQuestion[],
  )
}

export function getTemplateAnswers(type: string, answer) {
  return Object.assign({}, answer?.[type])
}
