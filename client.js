// EXERCISE

var syscalls = require('syscalls');

// Creates the server socket
var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

// Connect the socket to a port and address
syscalls.connect(fd, 3000, "0.0.0.0");

syscalls.write(fd, 'hi\n');

var data = syscalls.read(fd, 1024);
console.log(data);

syscalls.close(fd);