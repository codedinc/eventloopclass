var syscalls = require('syscalls');
var loop = new require("./loop").Loop();

// Creates the server socket
var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

// Set the socket as non-blocking
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

// Bind the socket to a port and address
syscalls.bind(fd, 3000, "0.0.0.0");

// Tell the socket to start listening for connections
syscalls.listen(fd, 100);

/////////////////////////////////////////////////////
loop.in(2, function() {
  console.log("This will print in 2 sec");
});
/////////////////////////////////////////////////////

loop.on(fd, 'read', function() {
  // New connection waiting, accept it
  loop.nextTick(function() { console.log("accepting...") });
  var connFd = syscalls.accept(fd);
  // Set the socket as non-blocking
  syscalls.fcntl(connFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
  
  loop.on(connFd, 'read', function() {
    // Socket is ready to be read
    var buf = syscalls.read(connFd, 1024);
    console.log(buf);
    loop.remove(connFd, 'read');
    
    loop.on(connFd, 'write', function() {
      // Socket is ready to be written to
      syscalls.write(connFd, 'bye!\n');
      
      loop.on(connFd, 'write', function() {
        // Done writing here
        syscalls.close(connFd);
        loop.remove(connFd, 'write');
      });
    });
  });
});

process.on('exit', function() {
  syscalls.close(fd);
});

loop.run();