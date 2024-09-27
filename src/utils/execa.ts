import type { Options, SyncOptions } from 'execa'
import { cwd } from 'node:process'

export const execaOpts: SyncOptions & Options = {
  cwd: cwd(),
  stdio: 'inherit',
}
