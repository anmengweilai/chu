import { defineConfig } from 'tsup';
import baseTSUPConfig from '../../tsup.config.base';

console.log('------');
export default defineConfig({
  ...baseTSUPConfig,
  splitting: false,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  dts: true,
  keepNames: true,
});
