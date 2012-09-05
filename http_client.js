var HTTPParser = process.binding('http_parser').HTTPParser;
var syscalls = require('syscalls');
var loop = new require("./loop").Loop();


var HTTPClient = function(host) {
  // Creates the server socket
  var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);

  // Set the socket as non-blocking
  syscalls.fcntl(fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);

  // Bind the socket to a port and address
  syscalls.connect(fd, 80, host);
  
  return {
    request: function(method, path) {

      loop.on(fd, 'write', function() {
        syscalls.write(fd, method + " " + path + " HTTP/1.1\r\n" +
                       "\r\n");
                       
        loop.remove(fd, 'write');
        
        loop.on(fd, 'read', function() {
          var data = syscalls.read(fd, 1024);
          console.log(data);
        });
      });
    }
  }
}

new HTTPClient(process.argv[2]).request(process.argv[3], process.argv[4]);

loop.run();