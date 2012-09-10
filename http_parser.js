// Extend Node internal parser to take care of data buffering.
var HTTPParser = process.binding('http_parser').HTTPParser;

exports.HTTPParser = HTTPParser;

HTTPParser.prototype.parse = function(data) {
  var buffer = this.buffer = this.buffer || "";
  var start = buffer.length;
  buffer += data;
  
  this.execute(new Buffer(buffer), start, data.length);
};

// Default to storing parsed info in the object
HTTPParser.prototype.onHeadersComplete = function(info) {
  this.info = info;
}
