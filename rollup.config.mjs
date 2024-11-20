import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';

const dev = process.env.ROLLUP_WATCH;

const plugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
    dedupe: ['lit']
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  typescript(),
  json(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled'
  }),
  dev && serve({
    contentBase: ['./dist'],
    host: '0.0.0.0',
    port: 5000,
    allowCrossOrigin: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }),
  !dev && terser()
].filter(Boolean);

export default {
  input: 'src/inventree-card.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins,
};