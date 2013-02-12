var object = { key: 'value' };
object['key'] = 'value';
object.key = 'value';

object.f = function() {};

function MyObject(x) {
  this.x = x;
}

var o = new MyObject(1);
console.log(o.x);

MyObject.prototype.y = 2;
console.log(o.y);

var module = require('./module');
module.x // 1
module.f()1