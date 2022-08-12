import { existsSync } from 'fs';
import { join } from 'path';
const root = join(__dirname, '../../../../');
const rootPkg = join(root, './package.json');

/**
 * 检测是否处于本地开发
 */
export function isLocalDev() {
  const isLocal = existsSync(rootPkg) && require(rootPkg)._local;
  return isLocal ? root : false;
}
