const debug = require("debug")("worker:utils");
const stream = require("stream");
const util = require('util');
const Writable = stream.Writable || require('readable-stream').Writable
// a memory store buffer consisting of google trending api responses
// TODO: replace this by putting it in the WriteableMemoryStream object??
const memoryStore = {};

/*******************************************************************************
 * Public API
 ******************************************************************************/
module.exports.getMemoryStoreAsObject = function(){
  let res = [];
  for(const [key] of Object.entries(memoryStore)){
    res.push(getMemoryStoreKeyAsObject(key));
  }
  return res;
};

/**
 * Builds the querystring that is set to the google trending API (as requried
 * by the API itself). Converts a json object into a valid querystring parameter
 * @param {*} opts 
 */
module.exports.getQueryString = function (opts){
  let queryString = `?`;

  debug("Given options", opts);

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

module.exports.getMemoryStoreKeyAsObject = getMemoryStoreKeyAsObject;

module.exports.WriteableMemoryStream = WriteableMemoryStream;

module.exports.strMapToObj = strMapToObj;

module.exports.objToStrMap = objToStrMap;

module.exports.strMapToJson = function (strMap) {
  return JSON.stringify(strMapToObj(strMap));
}

module.exports.jsonToStrMap = function (jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}

/*******************************************************************************
 * PRIVATE API
 ******************************************************************************/
function getMemoryStoreKeyValue(key){
  return memoryStore[key];
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
 * stream into the custom `memoryStore` map. The response data from the
 * Google Trends API is actually quite small (for 10-20 trends total), so
 * we don't really need to expect to process this into a final result in
 * the fashion that we would a real "stream" of data. Therefore, we will process
 * this data into a single static entity in memory, and then process it.
 * 
 * NOTE: I leave this data in the form of which it came; expected to have the
 * type of Buffer
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

function getMemoryStoreKeyAsObject(key){
  const val = getMemoryStoreKeyValue(key);

  // if we got a value back
  if(val){
    // strip up invalid first line: )]}'
    const str = val.toString().replace(/.*\n/, "");
    
    debug(`memoryStore[${key}] as object => `, JSON.parse(str));

    // then parse as json
    return str ? JSON.parse(str) : null;
  }
  return null;
}

function strMapToObj (strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    // We don’t escape the key '__proto__'
    // which can cause problems on older engines
    obj[k] = v;
  }
  return obj;
}

function objToStrMap (obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}