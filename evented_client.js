// EXERCISE

var syscalls = require('syscalls');
var loop = new require("./loop").Loop();

// Creates the server socket
var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

// Set the socket as non-blocking
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.connect(fd, 3000, "0.0.0.0");

loop.on(fd, 'write', function() {
  syscalls.write(fd, 'hi\n');

  loop.remove(fd, 'write');

  loop.on(fd, 'read', function() {
    var data = syscalls.read(fd, 1024);
    console.log(data);
  
    syscalls.close(fd);
    process.exit();
  });
});

loop.run();