var syscalls = require('syscalls');

var acceptFd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
syscalls.fcntl(acceptFd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
syscalls.bind(acceptFd, 3000, "0.0.0.0");
syscalls.listen(acceptFd, 100);

var users = []; // store the FDs

function accept() {
  var userFd = syscalls.accept(acceptFd);
  users.push(userFd);
  console.log("User connected on FD: " + userFd);
  syscalls.write(userFd, "Welcome!\n");
  return userFd;
}

function readAndBroadcastMessage(senderFd) {
  var msg = syscalls.read(senderFd, 1024);

  if (msg.length == 0) {
    disconnect(senderFd);
    return;
  }

  users.forEach(function(receiverFd) {
    if (receiverFd != senderFd) syscalls.write(receiverFd, "user " + senderFd + "> " + msg);
  });
}

function disconnect(fd) {
  console.log("User disconnected on FD: " + fd);
  syscalls.close(fd);
  users.splice(users.indexOf(fd), 1);
}

while (true) {
  var fds = syscalls.select(users.concat(acceptFd), [], []);

  var readableFds = fds[0];

  readableFds.forEach(function(fd) {
    if (fd == acceptFd) {
      accept();
    } else {
      readAndBroadcastMessage(fd);
    }
  });
}