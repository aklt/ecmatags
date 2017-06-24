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
  t.test('globFiles includes and excludes files', function (q) {
    q.plan(2)
    ecmatags.globFiles({
      include: ['*.js', '*.json', '*.md'],
      exclude: ['package-lock.json'],
      filename: 'tags'
    }, function (err, res) {
      if (err) throw err
      q.same(res.length, 4)
    })
    ecmatags.globFiles({
      include: ['*.js', '*.json', '*.md'],
      exclude: ['index.js', 'package-lock.json'],
      filename: 'tags'
    }, function (err, res) {
      if (err) throw err
      q.same(res.length, 3)
    })
  })
  t.test('tagFiles finds declarations', function (q) {
    q.plan(2)
    ecmatags.tagFiles([__filename], {limit: 3}, function (err, data) {
      q.same(err, null)
      q.same(data.length, 2)
    })
  })
})
