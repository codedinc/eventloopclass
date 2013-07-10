var syscalls = require('syscalls');
var loop = require('./loop');
var HTTPParser = require('./http_parser').HTTPParser;

function HttpServer(callback) {
  this.callback = callback;
}

HttpServer.prototype = {
  listen: function(port) {
    this.fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0);
    syscalls.fcntl(this.fd, syscalls.F_SETFL, syscalls.O_NONBLOCK);
    syscalls.bind(this.fd, port, "0.0.0.0");
    syscalls.listen(this.fd, 100);
  },

  start: function() {
    var self = this;

    loop.on(this.fd, 'read', function() {
      // New incoming connection
      var connFd = syscalls.accept(self.fd);
      new HttpServer.Connection(connFd, self.callback);
    });
  }
}

HttpServer.Connection = function(fd, callback) {
  this.fd = fd;
  this.callback = callback;
  var self = this;

  var parser = new HTTPParser(HTTPParser.REQUEST);

  loop.on(fd, 'read', function() {
    var data = syscalls.read(fd, 1024);

    if (data.length == 0) {
      // Client closed the connection
      loop.remove(fd, 'read');
      syscalls.close(fd);
      return;
    }

    parser.parse(data);
  });

  parser.onMessageComplete = function() {
    loop.remove(fd, 'read');

    var request = parser.info;
    console.log(request.method + " " + request.url);
    self.callback(request, self);
  }
}

HttpServer.Connection.prototype = {
  send: function(body) {
    var data = "HTTP/1.1 200 OK\r\n" + 
               "Content-Type: text/plain\r\n" +
               "Content-Length: " + body.length + "\r\n" +
               "\r\n" +
               body;

    var self = this;
    loop.once(this.fd, 'write', function() {
      syscalls.write(self.fd, data);
      syscalls.close(self.fd);
    });
  }
}


var server = new HttpServer(function(request, response) {
  response.send("You requested: " + request.url);
});

server.listen(3000);
server.start();

loop.run();