var http = require('http');

// NOTE: We're now using Node.js builtin event loop. NOT the loop we built in loop.js

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  if (req.url == "/slow") {
    var objects = [];
    
    // for (var i=0; i < 10000000; i++) {
    //   objects.push(new Object()); // pretend we're computing something here
    // };
    // res.end("slow request done");
    
    ////////////////////////////////////////////////////////////
    // EXERCISE: use nextTick to unblock the event loop.
    var i = 0;
    function compute() {
      objects.push(new Object());
      
      // Schedule another call unless we're done.
      if (i++ < 1000000) {
        process.nextTick(compute); // pretend we're computing something here
      } else {
        res.end("slow request done");
      }
    }
    compute();
    ////////////////////////////////////////////////////////////
    
  } else {
    res.end("fast request done");
    
  }
}).listen(3000);