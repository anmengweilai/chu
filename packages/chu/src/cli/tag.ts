import { crossSpawn, logger } from '@chu/utils';

export default async function (value: string, options: any) {
  console.log(value, options);
  logger.info('Is pulling the latest tags from the line ..... ');
  //清除远程已经不存在的分支的跟踪分支
  await crossSpawn('git', ['fetch', 'origin', '--prune']);
  const tags = await crossSpawn('git', []);
  console.log({ tags });
}
