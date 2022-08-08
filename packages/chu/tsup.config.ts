import { defineConfig } from 'tsup';
import baseTSUPConfig from '../../tsup.config.base';

export default defineConfig({
  ...baseTSUPConfig,
  splitting: false,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  dts: true,
  keepNames: true,
});
