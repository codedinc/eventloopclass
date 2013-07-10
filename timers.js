var loop = require('./loop');

loop.setTimeout(function() {
  console.log("this will be called in 1 sec");
}, 1000);

loop.setTimeout(function() {
  console.log("this will be called in 2 sec");
}, 2000);

loop.run();