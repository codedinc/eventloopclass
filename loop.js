var syscalls = require('syscalls');

var callbacks = {
  read: {}, // fd: function
  write: {}
};

// loop.on(fd, "read", function() {...})
exports.on = function(fd, event, callback) {
  callbacks[event][fd] = callback;
};

exports.remove = function(fd, event) {
  delete callbacks[event][fd];
};

exports.once = function(fd, event, callback) {
  exports.on(fd, event, function() {
    callback();
    exports.remove(fd, event);
  })
};

exports.run = function() {
  while (true) {
    var fds = syscalls.select(Object.keys(callbacks.read), Object.keys(callbacks.write), []);

    var readableFds = fds[0];
    var writableFds = fds[1];

    readableFds.forEach(function(fd) {
      var callback = callbacks.read[fd];
      callback();
    });
    writableFds.forEach(function(fd) {
      var callback = callbacks.write[fd];
      callback();
    });
  }
};