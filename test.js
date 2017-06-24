var path = require('path')
var test = require('tape')
var ecmatags = require('./')

test(function (t) {
  t.test('getOpts returns options', function (q) {
    q.plan(3)
    q.same(ecmatags.getOpts('--limit 10'.split(/\s+/g)), {
      limit: 10,
      include: [],
      filename: 'tags'
    })
    q.same(ecmatags.getOpts('--limit 10 foo.js **/*.js'.split(/\s+/g)), {
      limit: 10,
      include: [ 'foo.js', '**/*.js' ],
      filename: 'tags'
    })
    q.same(ecmatags.getOpts('--limit 10 foo.js **/*.js --exclude index.js'.split(/\s+/g)), {
      exclude: [ 'index.js' ],
      include: [ 'foo.js', '**/*.js' ],
      limit: 10,
      filename: 'tags'
    })
  })
  t.test('getFiles includes and excludes files', function (q) {
    q.plan(2)
    ecmatags.getFiles({
      include: ['*.js', '*.json', '*.md'],
      exclude: ['package-lock.json', 'test-*'],
      filename: 'tags'
    }, function (err, res) {
      if (err) throw err
      q.same(res.length, 4)
    })
    ecmatags.getFiles({
      include: ['*.js', '*.json', '*.md'],
      exclude: ['index.js', 'package-lock.json', 'test-*'],
      filename: 'tags'
    }, function (err, res) {
      if (err) throw err
      q.same(res.length, 3)
    })
  })
  t.test('tagFiles finds declarations', function (q) {
    q.plan(3)
    ecmatags.tagFiles([__filename], {limit: 3}, function (err, data) {
      if (err) throw err
      q.same(err, null)
      q.same(data.length, 3)
    })
    ecmatags.tagFiles([path.join(__dirname, 'test-example.js')], {limit: 3},
      function (err, data) {
        if (err) throw err
        // console.warn(require('util').inspect(data, 100))
        q.same(data.length, 14)
      })
  })
})
