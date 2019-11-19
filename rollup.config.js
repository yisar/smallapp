import typescript from 'rollup-plugin-typescript'

export default {
  input: './src/index.ts',
  output: {
    file: './dist/voe.js',
    format: 'umd',
    name: 'voe'
  },
  plugins: [
    typescript()
  ]
}