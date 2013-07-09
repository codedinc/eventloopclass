var syscalls = require('syscalls');
var dns = require('dns');

var host = process.argv[2];
var port = parseInt(process.argv[3]);

dns.lookup(host, function(err, address, family) {
  if (err) throw err;
  connect(address);
});

function connect(address) {
  var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
  syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

  syscalls.connect(fd, port, address);

  // 1) FD #0 (stdin): readable
  // 1) FD #fd: readable
  
  while (true) {
    var fds = syscalls.select([0, fd], [], []);

    var readableFds = fds[0];

    // 1) stdin readable (user typed something)
    if (readableFds.indexOf(0) != -1) {
      var data = syscalls.read(0, 1024);
      syscalls.write(fd, data);
    }

    // 2) server sent some data (fd is readable)
    if (readableFds.indexOf(fd) != -1) {
      var data = syscalls.read(fd, 1024);
      if (data.length == 0) return; // 0 byte read == disconnect.
      syscalls.write(1, data);
    }

  }
}