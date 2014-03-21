var httpParser = require('./http_parser')

// Create the parser
var parser = httpParser.createParser()

// Set the callback
parser.on('request', function(request) {
  console.log(request)
})

// Feed data to the parser
console.log("Parse status line")
parser.parse("GET / HTTP/1.1\r\n")

console.log("Parse headers")
parser.parse("Host: localhost\r\n")

console.log("Parse final line break")
parser.parse("\r\n")