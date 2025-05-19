import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

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
      sourcemap: true
    },
    plugins: sharedPlugins,
    onwarn(warning, warn) {
      // Skip certain warnings
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  },
  // Editor bundle as a separate build
  {
    input: 'src/editors/editor.ts',
    output: {
      dir: 'dist',
      format: 'es',
      entryFileNames: 'editor.js',
      sourcemap: true
    },
    external: ['lit', 'lit/decorators.js', 'custom-card-helpers'],
    plugins: sharedPlugins,
    onwarn(warning, warn) {
      // Skip certain warnings
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  }
];