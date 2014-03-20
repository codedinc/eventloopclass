// Extend Node internal parser to take care of data buffering and have a nicer API.
var HTTPParser = process.binding('http_parser').HTTPParser

var kOnHeaders = HTTPParser.kOnHeaders | 0;
var kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0
var kOnBody = HTTPParser.kOnBody | 0
var kOnMessageComplete = HTTPParser.kOnMessageComplete | 0

HTTPParser.prototype.parse = function(data) {
  var buffer = this.buffer = this.buffer || ""
  var start = buffer.length
  buffer += data
  
  this.execute(new Buffer(buffer), start, data.length)
}

HTTPParser.prototype.onComplete = function(callback) {
  this[kOnMessageComplete] = callback
}

exports.createParser = function() {
  var parser = new HTTPParser(HTTPParser.REQUEST)

  parser[kOnHeadersComplete] = function(info) {
    parser.info = info
    parser.info.method = HTTPParser.methods[info.method]
  }

  return parser
}