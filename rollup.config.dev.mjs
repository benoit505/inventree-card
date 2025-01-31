import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

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
        include: ['dev/**/*.ts'],
        exclude: ['src/**/*.ts'],
        sourceMap: true,
        inlineSources: true
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
    copy({
        targets: [
            { src: 'dev/index.html', dest: 'dist' }
        ]
    }),
    !process.env.ROLLUP_WATCH && terser(),
    serve({
        contentBase: ['./dist'],
        host: '0.0.0.0',
        port: 5000,
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
    input: 'dev/index.ts',
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