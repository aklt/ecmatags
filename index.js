
var fs = require('fs')
var os = require('os')

var esprima = require('esprima')
var glob = require('glob')
var parallelLimit = require('run-parallel-limit')

function getOpts (args) {
  var limit = 1 + os.cpus().length / 2
  if (limit === 2) limit = 1
  var defaultOptions = {
    limit: limit,
    filename: 'tags'
  }
  var opts = {
    include: []
  }
  for (var i = 0; i < args.length; i += 1) {
    var m = /^--?(\w+)$/.exec(args[i])
    if (m) {
      switch (m[1]) {
        case 'help':
          console.log(`Usage: ecmatags [options] [files]
  Options are:
    --help               show help
    --version            show version
    --limit <number>     max parallel, default 1 + CPUs / 2
    --exclude <pattern>  ignore these patterns
    --write <filename>   specify a file to write tags to`)
          return 0
        case 'version':
          console.log('Version: ' + require('./package.json').version)
          return 0
        case 'limit':
          i += 1
          opts.limit = parseInt(args[i], 10)
          break
        case 'exclude':
          i += 1
          if (!opts.exclude) opts.exclude = []
          opts.exclude.push(args[i])
          break
        case 'write':
          i += 1
          opts.filename = args[i]
          break
        default:
          console.warn('Unknown arg: --' + m[1])
      }
    } else {
      opts.include.push(args[i])
    }
  }
  return Object.assign({}, defaultOptions, opts)
}

var defaultGlobOpts = {
  realpath: true,
  absolute: true
}

function globFiles (o, cb) {
  var inc = o.include || []
  var exc = o.exclude || []
  var pattern = inc.join('|')
  var exclude = exc.join('|')
  if (inc.length > 1) pattern = '+(' + pattern + ')'
  if (exc.length > 1) exclude = '+(' + exclude + ')'
  glob(pattern, Object.assign({ignore: exclude}, defaultGlobOpts), cb)
}

var kinds = {
  const: 'C',
  constructor: 'c',
}

function tagFile (file, collect, cb) {
  fs.readFile(file, function (err, data) {
    if (err) return cb(err)
    var script = data.toString()
    if (script[0] === '#') script = script.slice(script.indexOf('\n'))

    try {
      esprima.parseScript(script, {
        comment: true,
        jsx: true,
        loc: true,
        tolerant: true
      }, (node) => {
        var kind
        switch (node.type) {
          case 'VariableDeclaration':
            return node.declarations.map((x) => {
//              console.warn(require('util').inspect(x, {depth: 101}))
              return collect(file, x.id, kinds[x.kind] || 'v')
            })
          case 'FunctionDeclaration':
            kind = 'f'
            if (node.id.generator) kind = 'g'
            return collect(file, node.id, kind)
          case 'ClassDeclaration':
            return collect(file, node.id, 'c')
          // case 'ExportDeclaration':
          //   return collect(file, node.id, kind)
          case 'MethodDefinition':
            return collect(file, node.key, 'm')
          default:
//            console.warn(require('util').inspect(node, {depth: 101}))
        }
      })
    } catch (e) {
      console.warn('Failed parsing file', file, e)
    }
    cb()
  })
}

function formatTabLine (filename, ident, kind) {
  if (!ident) return
  var line = [
    ident.name,
    filename,
    ':normal ' + ident.loc.start.line + 'G' +
                 (ident.loc.start.column + 1) + '|;"',
  ]
  if (kind) line.push(kind)
  return line.join('\t')
}

function tagFiles (files, opts, cb) {
  var result = []
  function collect (file, ident, kind) {
    result.push(formatTabLine(file, ident, kind))
  }
  var filesFunctions = files.map(f => {
    return function (cb0) {
      tagFile(f, collect, cb0)
    }
  })
  parallelLimit(filesFunctions, opts.limit, function (err) {
    if (err) return cb(err)
    cb(null, result)
  })
}

function writeFile (tags, opts, cb) {
  var tagsHeader = `!_TAG_FILE_FORMAT       1
!_TAG_FILE_SORTED       1       /0=unsorted, 1=sorted, 2=foldcase/
!_TAG_OUTPUT_MODE       tags
!_TAG_PROGRAM_NAME      ecmatags using esprima
!_TAG_PROGRAM_URL       https://github.com/aklt/ecmatags.git
!_TAG_PROGRAM_VERSION   ${require('./package').version}
`
  tags.sort()
  fs.writeFile(opts.filename, tagsHeader + tags.join('\n') + '\n', cb)
}

module.exports = {
  getOpts: getOpts,
  tagFile: tagFile,
  tagFiles: tagFiles,
  globFiles: globFiles,
  writeFile: writeFile
}
