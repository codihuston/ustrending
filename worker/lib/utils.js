const stream = require("stream");
const util = require('util');
const Writable = stream.Writable || require('readable-stream').Writable
// a memory store buffer consisting of google trending api responses
const memoryStore = {};

function getMemoryStoreKey(key){
  return memoryStore[key].toString().replace(/.*\n/, "");
}

module.exports.getMemoryStoreKeyAsJson = function (key){
  return JSON.parse(getMemoryStoreKey(key));
}

/* Writable memory stream */
function WriteableMemoryStream(key, options) {
  // allow use without new operator
  if (!(this instanceof WriteableMemoryStream)) {
    return new WriteableMemoryStream(key, options);
  }
  Writable.call(this, options); // init super
  this.key = key; // save key
  memoryStore[key] = Buffer.from([]); // empty
}

util.inherits(WriteableMemoryStream, Writable);

WriteableMemoryStream.prototype._write = function (chunk, enc, cb) {
  // our memory store stores things in buffers
  var buffer = (Buffer.isBuffer(chunk)) ?
    chunk :  // already is Buffer use it
    Buffer.from(chunk, enc);  // string, convert

  // concat to the buffer already there
  memoryStore[this.key] = Buffer.concat([memoryStore[this.key], buffer]);
  cb();
};

module.exports.WriteableMemoryStream = WriteableMemoryStream;

module.exports.getQueryString = function (opts){
  /**
   * builds the querystring used to sent to the google trending API
   * 
   */

  let queryString = `?`;

  console.log("Given options", opts);

  for(const [key, value] of Object.entries(opts)){
    // encoding json object
    if(typeof value === "object"){
      queryString += `${key}=${encodeURIComponent(JSON.stringify(value))}&`
    }
    else{
      queryString += `${key}=${value}&`
    }
  }
  return queryString;
}