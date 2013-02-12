var syscalls = require('syscalls');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.connect(fd, 3000, "0.0.0.0");

syscalls.select([], [fd], []);
syscalls.write(fd, "hi\n");

syscalls.select([fd], [], []);
var data = syscalls.read(fd, 1024);
console.log("Server sent: " + data);