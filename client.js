var syscalls = require('syscalls');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

syscalls.connect(fd, 3000, "0.0.0.0");

syscalls.write(fd, "hi\n");

var data = syscalls.read(fd, 1024);
console.log("Server sent: " + data);

syscalls.close(fd);