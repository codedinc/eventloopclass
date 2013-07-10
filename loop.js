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

var timers = [];
exports.setTimeout = function(callback, msec) {
  timers.push({
    timeout: new Date().getTime() + msec,
    callback: callback
  });
};

var nextTicks = [];
exports.nextTick = function(callback) {
  nextTicks.push(callback);
};

exports.run = function() {
  while (timers.length > 0 ||
         Object.keys(callbacks.read).length > 0 ||
         Object.keys(callbacks.write).length > 0 || 
         nextTicks.length > 0) {

    var timeout = 60;
    if (timers.length > 0) timeout = 1; // Over splification
    if (nextTicks.length > 0) timeout = 0;

    var fds = syscalls.select(Object.keys(callbacks.read), Object.keys(callbacks.write), [], timeout);

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

    var time = new Date().getTime();
    timers.slice(0).forEach(function(timer) {
      if (time >= timer.timeout) { // is timer due?
        timer.callback();
        timers.splice(timers.indexOf(timer), 1);
      }
    });

    var currentNextTicks = nextTicks;
    nextTicks = [];
    currentNextTicks.forEach(function(callback) {
      callback();
    });
  }
};