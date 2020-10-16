const stream = require("stream");
const util = require('util');
const Writable = stream.Writable || require('readable-stream').Writable
// a memory store buffer consisting of google trending api responses
const memoryStore = {};


/*******************************************************************************
 * PRIVATE API
 ******************************************************************************/
function getMemoryStoreKey(key){
  return memoryStore[key].toString().replace(/.*\n/, "");
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

// create custom writable memory stream
util.inherits(WriteableMemoryStream, Writable);

/**
 * Overrides default _write method. Will process a memory
 * stream into the custom `memoryStore` map.
 * 
 * @param {*} chunk 
 * @param {*} enc 
 * @param {*} cb 
 */
WriteableMemoryStream.prototype._write = function (chunk, enc, cb) {
  // our memory store stores things in buffers
  var buffer = (Buffer.isBuffer(chunk)) ?
    chunk :  // already is Buffer use it
    Buffer.from(chunk, enc);  // string, convert

  // concat to the buffer already there
  memoryStore[this.key] = Buffer.concat([memoryStore[this.key], buffer]);
  cb();
};

/*******************************************************************************
 * Public API
 ******************************************************************************/
module.exports.getMemoryStoreKeyAsJson = function (key){
  return JSON.parse(getMemoryStoreKey(key));
}

module.exports.WriteableMemoryStream = WriteableMemoryStream;

/**
 * Builds the querystring that is set to the google trending API (as requried
 * by the API itself). Converts a json object into a valid querystring parameter
 * @param {*} opts 
 */
module.exports.getQueryString = function (opts){
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