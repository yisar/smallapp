export default [
    {
        input: 'slave/index.js',
        output:
            { file: 'dist/slave.js', format: 'umd', name: 'freminiapp' },
    }, {
        input: 'master/index.js',
        output:
            { file: 'dist/master.js', format: 'esm' },

    }
]