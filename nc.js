var syscalls = require('syscalls')
var dns = require('dns')

var host = process.argv[2]
var port = parseInt(process.argv[3])

dns.lookup(host, function(err, address, family) {
  if (err) throw err
  connect(address)
})

function connect(address) {
  var serverFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
  syscalls.fcntl(serverFd, syscalls.F_SETFL, syscalls.O_NONBLOCK)

  syscalls.connect(serverFd, port, address)

  // - terminal is ready to be read, stdin = 0
  // - server sends some data, serverFd is readable

  while (true) {
    var fds = syscalls.select([0, serverFd], [], [])
    var readableFds = fds[0]

    // stdin readable
    if (readableFds.indexOf(0) != -1) {
      var data = syscalls.read(0, 1024)
      syscalls.write(serverFd, data)
    }

    // server sent something
    if (readableFds.indexOf(serverFd) != -1) {
      var data = syscalls.read(serverFd, 1024)
      if (data.length == 0) return; // Server closed the connection
      console.log(data)
    }
  }    
}