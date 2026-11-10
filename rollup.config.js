import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const plugins = () => [
    nodeResolve({
        browser: true,
    }),
    commonjs(),
    json(),
];

export default [
    {
        input: 'node_modules/idnumbers/dist/esm/index.js',

        output: {
            file: 'build/assets/lib/idnumbers.js',
            format: 'amd',
            amd: {
                id: 'idnumbers',
            },
        },

        plugins: plugins(),
    },
    {
        input: 'node_modules/ibantools/jsnext/ibantools.js',

        output: {
            file: 'build/assets/lib/ibantools.js',
            format: 'amd',
            amd: {
                id: 'ibantools',
            },
        },

        plugins: plugins(),
    },
];