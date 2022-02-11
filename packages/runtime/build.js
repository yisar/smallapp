const esbuild = require('esbuild')

esbuild.build({
    entryPoints: {
        master: './master/index.js',
        slave: './slave/index.js',
    },
    outdir: './dist/',
    loader: {
        '.js': 'jsx'
    },
    format: 'esm',
    jsxFactory: "h",
    jsxFragment: "Fragment",
    bundle: true,
    sourcemap: false,
    treeShaking: true,
}).then(() => {
    console.log('build success')
})