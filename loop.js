var syscalls = require('syscalls')

var callbacks = {
  read: {
    // fd: callback
  },
  write: {
    // fd: callback
  }
}

// loop.on(fd, 'read', function() { ... })
exports.on = function(fd, event, callback) {
  callbacks[event][fd] = callback
}

exports.remove = function(fd, event) {
  delete callbacks[event][fd]
}

var timers = []
exports.setTimeout = function(callback, msec) {
  timers.push({
    callback: callback,
    timeout: new Date().getTime() + msec
  })
}

exports.run = function() {
  while (Object.keys(callbacks.read).length > 0 ||
         Object.keys(callbacks.write).length > 0 ||
         timers.length > 0) {

    var timeout = 60
    if (timers.length > 0) timeout = 1

    var fds = syscalls.select(Object.keys(callbacks.read),
                              Object.keys(callbacks.write),
                              [], timeout)
    var readableFds = fds[0]
    var writableFds = fds[1]

    readableFds.forEach(function(fd) {
      var callback = callbacks.read[fd]
      callback()
    })  
    writableFds.forEach(function(fd) {
      var callback = callbacks.write[fd]
      callback()
    })

    var time = new Date().getTime()
    timers.slice(0).forEach(function(timer) {
      if (time >= timer.timeout) { // is the timer due (or overdue)?
        timer.callback()
        timers.splice(timers.indexOf(timer), 1)
      }
    })
  }
}