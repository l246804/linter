import type { Recordable } from '@/types/utils'

const DEP_VERSION_MAP: Recordable<string> = {
  '@changesets/cli': '^2',

  'husky': '^9',
  '@commitlint/cli': '^19',
  '@commitlint/types': '^19',
  '@commitlint/config-conventional': '^19',

  'commitizen': '^4',
  'git-cz': '^4',
  'cz-git': '^1',
  'cz-conventional-changelog': '^3',

  'typescript': '^5',

  'eslint': '^9',
  '@antfu/eslint-config': '^3',
  'prettier': '^3',

  'release-it': '^17',
  '@release-it/conventional-changelog': '^8',

  'postcss': '^8',
  'postcss-less': '^6',
  'postcss-scss': '^4',
  'postcss-html': '^1',

  'stylelint': 'latest',
  'stylelint-config-standard': 'latest',
  'stylelint-order': 'latest',
  'stylelint-config-property-sort-order-smacss': 'latest',
  'stylelint-config-standard-less': 'latest',
  'stylelint-config-standard-scss': 'latest',
  'stylelint-config-standard-vue': 'latest',

  'unbuild': '^2',

  'vite': '^5',
  'vite-plugin-dts': '^4',
  'rollup': '^4',
}

function joinVersion(dep: string) {
  const version = DEP_VERSION_MAP[dep]
  if (dep.indexOf('@') > 0 || !version)
    return dep
  return `${dep}@${version}`
}

export function mapDeps(deps: string[]) {
  return deps.map(joinVersion)
}
