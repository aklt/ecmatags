
var varDecl0
var varDecl1 = 12

let letDecl0
let letDecl1 = 'foo'

const constDecl = 10
const constDecl1 = {}

var arrowFuncVar = (a, b) => {
}

function functionFoo (a, b) {
  return a + b
}

var obj = {
  prop1: 12,
  prop2: 100,
  objMethod (a, b) {
    return a - b
  }
}

class FooClass {
  constructor (a, b, c) {
  }
}

class BarClass extends FooClass {
  constructor (a, b, c) {
  }

  memberMethod (xx) {
  }
}

module.exports = {
  FooClass,
  obj
}
