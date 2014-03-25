var syscalls = require('syscalls')

syscalls.write(1, 'Hello\n')

var data = syscalls.read(0, 10)
console.log("You typed: " + data)