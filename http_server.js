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
      var connFd = syscalls.accept(self.fd);
      new HttpServer.Connection(connFd, self.callback);
    })
  }
}

HttpServer.Connection = function(fd, callback) {
  var self = this;
  this.fd = fd;
  this.callback = callback;

  var parser = new HTTPParser(HTTPParser.REQUEST);

  loop.on(fd, 'read', function() {
    var data = syscalls.read(fd, 1024);
    parser.parse(data);
  })

  parser.onMessageComplete = function() {
    loop.remove(fd, 'read');

    var request = parser.info;
    console.log(request.method + " " + request.url);
    self.callback(request, self)
  }
}

HttpServer.Connection.prototype = {
  send: function() {

  }
}


var server = new HttpServer(function(request, response) {
  response.send("zomg!\n");
});

server.listen(3000);
server.start();

loop.run();

