var syscalls = require('syscalls');

var files = process.argv.slice(2);

files.forEach(function(file) {
  var fd = syscalls.open(file, syscalls.O_RDONLY);
  var data;
  while ((data = syscalls.read(fd, 1024)).length > 0) {
    syscalls.write(1, data);
  }
  syscalls.close(fd);
});