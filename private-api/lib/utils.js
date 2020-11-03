/**
 * Returns a promise designed to space out outgoing requests to the Yahoo API.
 *
 * @param {*} ms
 */
module.exports.sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
