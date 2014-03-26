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

  loop.on(this.fd, 'read', function() {
    var data = syscalls.read(fd, 1024)
    parser.parse(data)
  })

  var self = this
  parser.on('request', function(request) {
    loop.remove(fd, 'read')
    console.log(request.method + ' ' + request.url)
    self.callback(request, self)
  })
}

Connection.prototype.send = function(body) {
  
}



var server = new HttpServer(function(req, res) {
  res.send("WOW MUCH WEB SERVER!")
})

server.listen(3000)
server.start()

loop.run()