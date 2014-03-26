var loop = require('./loop')

loop.nextTick(function() {
  console.log("This will print last")
  loop.nextTick(function() {
    console.log("Nested ...")
  })
})

console.log("This will print first")

loop.run()