const chokidar = require("chokidar")
const Path = require("path")
const build = require("./bundle")
const pack = require("./package")
const serve = require("./serve")
const argv = require("./commander")
// const { spawn, execFile, execFileSync } = require("child_process")
const BUILD_TYPE = {
  BUILD: 'build'
}

async function run(argv) {
  const options = {
    e: argv.entry,
    o: argv.output,
    i: "/",
    w: argv.watch,
    m: argv.minify,
    p: argv.publicUrl,
    t: argv.t,
  }
  start(options)
  if (options.w) {
    chokidar
      .watch(Path.dirname(options.e), {
        ignored: /(dist|.git)/,
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 500,
        },
      })
      .on("change", (path) => {
        console.log(`rebuild ${path}`)
        start(options)
      })
  }
}

async function start(options) {
  options.old && options.old.close()
  console.log('start compiling...')
  const start = Date.now()
  const adt = await build(options.e, options)
  await pack(adt, options)
  const end = Date.now()
  console.log(`compile total time ${end - start}ms`)
  serve(options)
  // execFile(Path.join(__dirname, '../../container/fre_miniapp.exe'))
}

if (argv.version) {
  console.log('version:', require('../package.json').version)
} else {
  run(argv)
}
