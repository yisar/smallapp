const { manifest } = require('../package.js')
const Path = require('path')
const esbuild = require('esbuild')

module.exports = async function packBerial(asset, options) {
  const edir = Path.resolve(Path.dirname(options.e))

  try {
    var { code } = await esbuild.transform(asset.output.jsx, {
      jsxFactory: 'fre.h',
      jsxFragment: 'fre.Fragment',
      loader: 'jsx',
      format: 'cjs',
    })
  } catch (e) {
  }

  asset.output.jsx = String(code)

  const path = asset.path.replace(edir, '').replace(/\\/g, '/').replace('.json', '')

  const prefix = options.p ? options.p : '/'
  const basename = options.p ? `${'/' + Path.basename(options.p)}` : ''
  const hash = prefix + asset.hash
  manifest.push({
    id: asset.id,
    info: asset.ast,
    scripts: [hash + '.js', hash + '.jsx'],
    styles: [hash + '.css'],
    path: `${basename + path}`,
  })
}
