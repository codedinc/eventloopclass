var syscalls = require('syscalls');

var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

syscalls.bind(fd, 3000, "0.0.0.0");

syscalls.listen(fd, 100);

while (true) {
  syscalls.select([fd], [], []);
  var connFd = syscalls.accept(fd);
  console.log("Accepted new connection");

  syscalls.select([connFd], [], []);
  var data = syscalls.read(connFd, 1024);
  console.log("Received: " + data);

  syscalls.select([], [connFd], []);
  syscalls.write(connFd, 'bye!\n');

  syscalls.close(connFd);
}