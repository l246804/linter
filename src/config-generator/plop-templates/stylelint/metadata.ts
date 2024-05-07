import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { isPackageExists } from 'local-pkg'
import { defineMetadata } from '../../utils/template'
import { $dir } from '@/utils/path'

export default defineMetadata({
  name: 'stylelint',
  description: 'Stylelint configuration.',
  prompts: [
    {
      type: 'confirm',
      name: 'order',
      message: 'Order?',
      default: true,
    },
    {
      type: 'list',
      name: 'lang',
      message: 'Select style lang:',
      choices: [
        { name: 'css', value: 'css' },
        { name: 'less', value: 'less' },
        { name: 'scss', value: 'scss' },
      ],
      default: () => {
        const langs = new Set<string>()

        pushLang('less')
        pushLang('scss')
        pushLang('sass', 'scss')

        function pushLang(lang: string, realLang = lang) {
          isPackageExists(lang) && langs.add(realLang)
        }

        return langs.size === 0 || langs.size > 1 ? 'css' : [...langs][0]
      },
    },
    {
      type: 'confirm',
      name: 'vue',
      message: 'Vue?',
      default: false,
      when: () => !isPackageExists('vue'),
    },
  ],
  processAnswer: (data) => {
    data.vue ??= true
    if (data.lang === 'scss')
      data.sass = !isPackageExists('sass')
  },
  deps: (data) => [
    'postcss',
    'stylelint',
    'stylelint-config-standard',

    data.sass && 'sass',

    ...(data.order ? ['stylelint-order', 'stylelint-config-property-sort-order-smacss'] : []),

    ...(data.lang !== 'css'
      ? [
          `postcss-${data.lang}`,
          `stylelint-config-standard-${data.lang}`,
        ]
      : []),

    ...(data.vue
      ? ['postcss-html', 'stylelint-config-standard-vue']
      : []),
  ],
  actions: (data) => {
    data[data.lang] = true
    return [
      {
        type: 'add',
        templateFile: resolve($dir(__dirname), 'default.hbs'),
        path: resolve(cwd(), 'stylelint.config.js'),
        data,
      },
    ]
  },
})
