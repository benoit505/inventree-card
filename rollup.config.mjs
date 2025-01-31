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
    dedupe: ['lit'],
    extensions: ['.ts', '.js', '.json']
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  typescript({
    tsconfig: './tsconfig.json',
    include: ['src/**/*.ts'],
    exclude: ['dev/**/*.ts'],
    sourceMap: true,
    inlineSources: true,
    module: 'esnext'
  }),
  json(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
    extensions: ['.ts'],
    presets: [
      ['@babel/preset-typescript']
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }]
    ]
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
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: 'inventree-card.js',
    sourcemap: true,
    preserveModules: false
  },
  preserveEntrySignatures: false,
  context: 'this',
  plugins,
};