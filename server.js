var syscalls = require('syscalls')

var acceptingFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)

syscalls.bind(acceptingFd, 3000, "0.0.0.0")

syscalls.listen(acceptingFd, 100)

console.log("Listening for connection son port 3000")

while (true) {
  var connectionFd = syscalls.accept(acceptingFd)
  console.log("Accepted new connection")

  var data = syscalls.read(connectionFd, 1024)
  console.log("Received: " + data)

  syscalls.write(connectionFd, "bye!\n")

  syscalls.close(connectionFd)
}
