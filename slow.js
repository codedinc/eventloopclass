var http = require('http');

// NOTE: We're now using Node.js builtin event loop. NOT the loop we built in loop.js

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  if (req.url == "/slow") {
    var objects = [];
    
    for (var i=0; i < 10000000; i++) {
      objects.push(new Object()); // pretend we're computing something here
    };
    res.end("slow request done");
        
  } else {
    res.end("fast request done");
    
  }
}).listen(3000);