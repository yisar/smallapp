const esbuild = require('esbuild')

esbuild.build({
    entryPoints: {
        core: './master/Master.js',
        render: './slave/Slave.js',
    },
    outdir: './base/',
    format: 'esm',
    bundle: true,
    sourcemap: false,
    treeShaking: true,
    watch: true,
}).then(() => {
    console.log('build success')
})
