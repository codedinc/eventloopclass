var syscalls = require('syscalls')
var dns = require('dns')

var url = process.argv[2]

var matches = /^http:\/\/([\.\w]+)/.exec(url)
var host = matches[1]

dns.lookup(host, function(err, address, family) {
  if (err) throw err
  connect(address)
})

function connect(address) {
  var fd = syscalls.socket(syscalls.AF_INET, syscalls.SOCK_STREAM, 0)

  syscalls.connect(fd, 80, address)

  syscalls.write(fd, "GET " + url + " HTTP/1.1\r\n" +
                     "Connection: close\r\n" +
                     "\r\n")

  var data
  while ((data = syscalls.read(fd, 1024)).length > 0) {
    syscalls.write(1, data)
  }

  syscalls.close(fd)
}