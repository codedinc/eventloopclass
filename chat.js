var syscalls = require('syscalls');
var loop = require('./loop');

var acceptFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(acceptFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
syscalls.bind(acceptFd, 3000, "0.0.0.0");
syscalls.listen(acceptFd, 100);

var users = []; // store the FDs

function accept() {
  var connFd = syscalls.accept(acceptFd);
  users.push(connFd);
  console.log("User connected on FD: " + connFd);
  syscalls.write(connFd, 'Welcome!\n');
  return connFd;
}

function readAndBroadcastMessage(fd) {
  var msg = syscalls.read(fd, 1024);

  if (msg.length == 0) {
    disconnect(fd);
    return;
  }

  users.forEach(function(receiverFd) {
    if (receiverFd != fd) syscalls.write(receiverFd, 'user ' + fd + "> " + msg);
  });
}

function disconnect(fd) {
  console.log("User disconnected on FD: " + fd);
  syscalls.close(fd);
  users.splice(users.indexOf(fd), 1);
  loop.remove(fd, 'read');
}

loop.on(acceptFd, 'read', function() {
  var userFd = accept();

  loop.on(userFd, 'read', function() {
    readAndBroadcastMessage(userFd)
  });
});

loop.run();
