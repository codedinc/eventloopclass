var syscalls = require('syscalls')
var loop = require('./loop')
var httpParser = require('./http_parser')

function HttpServer(callback) {
  this.callback = callback
}

HttpServer.prototype.listen = function(port) {
  this.fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)
  syscalls.fcntl(this.fd, syscalls.F_SETFL, syscalls.O_NONBLOCK)
  syscalls.bind(this.fd, port, "0.0.0.0")
  syscalls.listen(this.fd, 100)
}

HttpServer.prototype.start = function() {
  var self = this

  loop.on(this.fd, 'read', function() {
    var connFd = syscalls.accept(self.fd)
    new Connection(connFd, self.callback)
  })
}


function Connection(fd, callback) {
  this.fd = fd
  this.callback = callback

  var parser = httpParser.createParser()
  var self = this

  loop.on(this.fd, 'read', function() {
    var data = syscalls.read(fd, 1024)
    if (data.length == 0) {
      // Connection was closed by the client
      loop.remove(self.fd, 'read')
      syscalls.close(self.fd)
      return
    }
    parser.parse(data)
  })

  parser.on('request', function(request) {
    loop.remove(fd, 'read')
    console.log(request.method + ' ' + request.url)
    self.callback(request, self)
  })
}

Connection.prototype.send = function(body) {
  var data = "HTTP/1.1 200 OK\r\n" +
             "Content-Type: text/plain\r\n" +
             "Content-Length: " + body.length + "\r\n" +
             "\r\n" +
             body

  var self = this
  loop.on(this.fd, 'write', function() {
    syscalls.write(self.fd, data)
    syscalls.close(self.fd)
    loop.remove(self.fd, 'write')
  })
}



var server = new HttpServer(function(req, res) {
  if (req.url == "/slow") {
    var objects = []
        
    for (var i = 0; i < 10000000; i++) {
      objects.push(new Object()) // pretend we're computing something here
    }
    res.send("slow request done\n")
  } else {
    res.send("fast request done\n")
  }
})

server.listen(3000)
server.start()

loop.run()