var loop = require('./loop')

loop.nextTick(function() {
  console.log("This will print last")
})

console.log("This will print first")

loop.run()