import { fsExtra } from '@chu/utils';

/**
 * 只要当前存在一个列表中的指定文件都会返回文件类型
 * @param name
 * @param types
 * @return {existence:boolean;type:string,name:string}
 */
export function checkConfigFileList(name: string, types: string[] = ['json']) {
  let type = 'unknown';
  let existence = false;
  for (const typeItem of types) {
    if (checkConfigFile(name, typeItem)) {
      existence = true;
      type = typeItem;
      break;
    }
  }
  return { existence, type, name: `${name}.${type}` };
}

export function checkConfigFile(name: string, type: string | [] = 'json') {
  return fsExtra.existsSync(`${name}.${type}`);
}
