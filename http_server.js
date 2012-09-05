var HTTPParser = process.binding('http_parser').HTTPParser;
var syscalls = require('syscalls');
var loop = new require("./loop").Loop();


var HTTPServer = function(callback) {
  // Creates the server socket
  var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

  // Set the socket as non-blocking
  syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

  // Bind the socket to a port and address
  syscalls.bind(fd, 3000, "0.0.0.0");

  // Tell the socket to start listening for connections
  syscalls.listen(fd);
  
  process.on('exit', function() {
    syscalls.close(fd);
  });
  
  return {
    start_: function() {
      loop.on(fd, 'read', function() {
        // New connection waiting, accept it
        var connFd = syscalls.accept(fd);

        // Set the socket as non-blocking
        syscalls.fcntl(connFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
        new HTTPServer.Connection(connFd, callback);
      });
    },
    
    /////////////////////////////////////////////////
    // Prefork
    start: function() {
      loop.on(fd, 'read', function() {
        // New connection waiting, accept it
        try {
          var connFd = syscalls.accept(fd);
        } catch (e) {
          // Catch EWOULDBLOCK raised in child processes that did
          // not accept the connection in time. (Another child did.)
        }
        
        if (connFd) {
          // Set the socket as non-blocking
          syscalls.fcntl(connFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
          new HTTPServer.Connection(connFd, callback);
        }
      });
    },
    
    fork: function(count) {
      if (syscalls.fork() == 0) {
        console.log("In child process: " + syscalls.getpid());
        this.start();
      } else {
        console.log("In master process: " + syscalls.getpid());
        if (--count > 0) this.fork(count);
      }
    }
    /////////////////////////////////////////////////
  }
}


HTTPServer.Connection = function(fd, callback) {
  var parser = new HTTPParser(HTTPParser.REQUEST);
  var request = null;
  
  parser.onHeadersComplete = function(info) {
    request = info;
  };

  parser.onMessageComplete = function() {
    loop.remove(fd, 'read');
    process();
  };
  
  var buffer = new Buffer(4096);
  var bufferLength = 0;
  // Wait for the request to arrive
  loop.on(fd, 'read', function() {
    // Buffer received data
    var data = syscalls.read(fd, 1024);
    buffer.write(data, bufferLength);
    bufferLength += data.length;
    
    // Send received data to the HTTP parser
    parser.execute(buffer, 0, bufferLength);
  });
  
  // Start processing the request
  function process() {
    console.log(request);
    var responseBody = callback(request);
    console.log(responseBody);
    
    
  ///////////// vv EXERCISE vv /////////////
    sendResponse("HTTP/1.1 200 OK\r\n" +
                 "Content-Type: text/plain\r\n" +
                 "Content-Length: " + responseBody.length + "\r\n" +
                 "\r\n" +
                 responseBody);
  }
  
  function sendResponse(data) {
    loop.on(fd, 'write', function() {
      // Send data and close the connection
      syscalls.write(fd, data);
      closeAfterWriting();
    });
  }
  
  function closeAfterWriting() {
    loop.on(fd, 'write', function() {
      syscalls.close(fd);
      loop.remove(fd, 'write');
    });
  }
  ///////////// END EXERCISE /////////////
}

var server = new HTTPServer(function(request) {
  return "you requested: " + request.url + "\n";
  // return "you requested: " + request.url + " from process: " + syscalls.getpid() + "\n";
});

server.start();
// server.fork(3);

loop.run();