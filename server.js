var syscalls = require('syscalls')

var acceptingFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
syscalls.fcntl(acceptingFd, syscalls.F_SETFL, syscalls.O_NONBLOCK)

syscalls.bind(acceptingFd, 3000, "0.0.0.0")

syscalls.listen(acceptingFd, 100)

console.log("Listening for connection son port 3000")

while (true) {
  syscalls.select([acceptingFd], [], [])
  var connectionFd = syscalls.accept(acceptingFd)
  console.log("Accepted new connection")

  syscalls.select([connectionFd], [], [])
  var data = syscalls.read(connectionFd, 1024)
  console.log("Received: " + data)

  syscalls.select([], [connectionFd], [])
  syscalls.write(connectionFd, "bye!\n")

  syscalls.close(connectionFd)
}
