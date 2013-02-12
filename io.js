var syscalls = require('syscalls');

syscalls.write(1, 'Hello\n');

var data = syscalls.read(0, 1024);
console.log(data);