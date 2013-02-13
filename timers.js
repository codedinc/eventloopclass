var loop = require('./loop');

loop.setTimeout(function() {
  console.log("this will print in 1sec");
}, 1000);

loop.setTimeout(function() {
  console.log("this will print in 2sec");
}, 2000);

loop.run();