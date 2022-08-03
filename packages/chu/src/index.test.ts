import index from './index';
import { getRcPath } from './utils/rcFile';

test('normal', () => {
  expect(index()).toEqual('chu');
});

test('rcFile.ts', () => {
  expect(getRcPath()).toEqual('.churc');
});
