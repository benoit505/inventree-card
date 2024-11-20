import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve({}),
  commonjs(),
  typescript(),
  json(),
  replace({
    'lit/decorators.js': '/local/lit/decorators.js',
    'lit': '/local/lit',
    'custom-card-helpers': '/local/custom-card-helpers',
    preventAssignment: true
  }),
  babel({
    exclude: 'node_modules/**',
  }),
  copy({
    targets: [
      { src: 'dev/index.html', dest: 'dist' }
    ]
  }),
  dev && serve(serveopts),
  !dev && terser(),
].filter(Boolean);

export default {
  input: ['src/inventree-card.ts', 'src/editor.ts'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].js',
  },
  plugins: [...plugins],
  external: [
    '/local/lit',
    '/local/lit/decorators.js',
    '/local/custom-card-helpers',
  ],
}; 