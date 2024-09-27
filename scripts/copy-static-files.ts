import { resolve } from 'node:path'
import fg from 'fast-glob'
import fs from 'fs-extra'
import { distDir, srcDir } from '../internal/paths'

const files = fg.globSync([
  '**/*.hbs',
], {
  cwd: srcDir,
  onlyFiles: true,
})

files.forEach((file) => {
  fs.copySync(resolve(srcDir, file), resolve(distDir, file))
})
