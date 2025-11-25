import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

const plugins = [
    resolve(),
    commonjs(),
    typescript({
        tsconfigOverride: {
            compilerOptions: {
                declaration: true,
                declarationDir: 'dist',
            },
            include: ['src'],
        },
    }),
]

export default [
    // ESM (for Vite/Webpack/modern bundlers)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.esm.js',
            format: 'es',
            sourcemap: true,
        },
        plugins,
    },

    // CommonJS (for Node.js)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
        plugins,
    },

    // UMD (for <script> in browser)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/janus.global.js',
            format: 'umd',
            name: 'JanusJs',
            sourcemap: true,
        },
        plugins,
    },
]
