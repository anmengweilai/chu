import Fuse from 'fuse.js';

/**
 *  需要手动筛选数据 可调节的模糊-精准查询
 * @param search
 * @param list
 * @param keys
 * @param option
 */
export const dataFilter = (
  search: string | Fuse.Expression,
  list: any[],
  keys: any[],
  option = {},
) => {
  const options = {
    shouldSort: true, // 是否按分数对结果列表排序
    includeScore: true, //  是否应将分数包含在结果集中。0分表示完全匹配，1分表示完全不匹配。
    threshold: 0.1, // 匹配算法阈值。阈值为0.0需要完全匹配（字母和位置），阈值为1.0将匹配任何内容。
    /**
     * 确定匹配与模糊位置（由位置指定）的距离。一个精确的字母匹配，即距离模糊位置很远的字符将被视为完全不匹配。
     *  距离为0要求匹配位于指定的准确位置，距离为1000则要求完全匹配位于使用阈值0.8找到的位置的800个字符以内。
     */
    location: 0, // 确定文本中预期找到的模式的大致位置。
    distance: 100,
    maxPatternLength: 32, // 模式的最大长度
    minMatchCharLength: 1, // 模式的最小字符长度
    ...option,
    keys,
  };
  const fuse = new Fuse(list, options);
  return fuse.search(search).map((item) => item.item);
};
