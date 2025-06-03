import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';

const plugins = [
    replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        preventAssignment: true
    }),
    nodeResolve({
        browser: true,
        preferBuiltins: false,
        dedupe: ['lit'],
        extensions: ['.ts', '.tsx', '.js', '.json']
    }),
    commonjs({
        include: 'node_modules/**'
    }),
    typescript({
        tsconfig: './tsconfig.json',
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['dev/**/*.ts', 'node_modules/**'],
        sourceMap: true,
        inlineSources: true,
    }),
    json(),
    postcss({
        extract: true,
        minimize: false,
        sourceMap: 'inline',
    }),
    babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        presets: [
            ['@babel/preset-react', { runtime: 'automatic' }]
        ],
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }]
        ]
    }),
    copy({
        targets: [
            { src: 'dev/index.html', dest: 'dist' }
        ]
    }),
    !process.env.ROLLUP_WATCH && terser(),
    serve({
        contentBase: ['./dist'],
        host: '0.0.0.0',
        port: 5021,
        allowCrossOrigin: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    }),
    livereload({
        port: 35729,
        watch: 'dist'
    })
].filter(Boolean);

export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: 'inventree-card.js',
        sourcemap: true,
    },
    preserveEntrySignatures: false,
    context: 'this',
    plugins,
    watch: {
        clearScreen: false
    }
}; 