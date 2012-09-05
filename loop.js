// == Sample event loop ==
// This is teaching material. Do not use this! It makes no sense to use another
// event loop inside Node.js. It would be like putting flip-flops on your 
// shoes. But I believe this is the best way to each how event loops work.
var syscalls = require('syscalls');

exports.Loop = function() {
  var watches = { read: {}, write: {} };
  var nextTicks = [];
  var timer = 0;
  var timers = [];
  
  return {
    on: function(fd, state, callback) {
      watches[state][fd] = callback;
    },
    
    nextTick: function(callback) {
      nextTicks.push(callback);
    },
    
    // Timer
    in: function(sec, callback) {
      timers.push({ timeout: timer + sec, callback: callback});
    },
    
    remove: function(fd, state) {
      delete watches[state][fd];
    },
    
    run: function() {
      // The actual event ... loop
      for (;;) {
        ///////////////// AFTER /////////////////
        // Call the nextTick callbacks
        for (var i=0; i < nextTicks.length; i++) nextTicks[i]();
        nextTicks = []; // Only called once, reset.
        /////////////////////////////////////////
        
        // Synchronous I/O multiplexing
        var fds = syscalls.select(Object.keys(watches.read), Object.keys(watches.write), [], timers.length > 0 ? 1 : 0); // 0);
        
        ///////////////// AFTER /////////////////
        // Check timers
        timer++;
        for (var i=0; i < timers.length; i++) {
          if (timers[i].timeout <= timer) {
            timers[i].callback();
            timers.splice(i, 1);
          }
        }
        /////////////////////////////////////////
        
        // FDs ready to be read
        var readableFds = fds[0];
        
        // FDs ready to be written to
        var writableFds = fds[1];
      
        // Call the appropriate callbacks
        for (var i=0; i < readableFds.length; i++) {
          var fd = readableFds[i];
          watches.read[fd]();
        }
        for (var i=0; i < writableFds.length; i++) {
          var fd = writableFds[i];
          watches.write[fd]();
        }
      };
    }
  };  
};
