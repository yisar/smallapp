export default [
  {
    input: './packages/bridge/src/index.js',
    output: {
      file: './packages/bridge/dist/voe-bridge.js',
      format: 'umd',
      name: 'voe-bridge',
    },
  },
]
