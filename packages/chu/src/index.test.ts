import os from 'os';
import path from 'path';
import index from './index';
import { getRcPath } from './utils/rcFile';

test('normal', () => {
  expect(index()).toEqual('chu');
});

test('rcFile.ts', () => {
  console.log(getRcPath());
  expect(getRcPath()).toEqual(path.join(os.homedir(), '.churc'));
});
