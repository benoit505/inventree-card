import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

const dev = process.env.ROLLUP_WATCH;

const sharedPlugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
    dedupe: ['lit'],
    extensions: ['.ts', '.tsx', '.js', '.json']
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
  }),
  typescript({
    tsconfig: './tsconfig.json',
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    exclude: ['dev/**/*.ts'],
    sourceMap: true,
    inlineSources: true,
  }),
  json(),
  postcss({
    extract: true,
    minimize: !dev,
    sourceMap: dev ? 'inline' : false,
  }),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
    extensions: ['.js', '.jsx'],
    presets: [
      ['@babel/preset-react', { runtime: 'automatic' }]
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

// Build two separate bundles to avoid circular references
export default [
  // Main card bundle
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      entryFileNames: 'inventree-card.js',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: sharedPlugins,
    onwarn(warning, warn) {
      // Skip certain warnings
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  },
  // DTS bundle
  {
    input: 'dist/tmp/index.d.ts',
    output: [{ file: 'dist/inventree-card.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/],
  }
];