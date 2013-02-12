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

  syscalls.connect(fd, port, address);
  
  syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

  // stdin: 0
  // socket: fd
  while (true) {
    var fds = syscalls.select([0, fd], [], []);

    var readableFds = fds[0];

    // stdin readable
    if (readableFds.indexOf(0) != -1) {
      var data = syscalls.read(0, 1024);
      syscalls.write(fd, data);
    };

    // socket readable
    if (readableFds.indexOf(fd) != -1) {
      var data = syscalls.read(fd, 1024);
      if (data.length == 0) return;
      syscalls.write(1, data);
    };
  }
}