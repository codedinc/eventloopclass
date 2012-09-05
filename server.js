var syscalls = require('syscalls');

// Creates the server socket
var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

// Set the socket as non-blocking
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

// Bind the socket to a port and address
syscalls.bind(fd, 3000, "0.0.0.0");

// Tell the socket to start listening for connections
syscalls.listen(fd, 100);

// Use I/O multiplexing function `select` to watch fd for readability
var fds = syscalls.select([fd], [], [], 0);

var connFd = syscalls.accept(fd);

var buf = syscalls.read(connFd, 1024);
console.log(buf);

syscalls.write(connFd, 'bye!\n');

syscalls.close(connFd);
syscalls.close(fd);