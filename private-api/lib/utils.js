/**
 * Returns a promise designed to space out outgoing requests to the Yahoo API.
 *
 * @param {*} ms
 */
module.exports.sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports.secondsAs = function (unit, times = 1) {
  let res = 0;
  switch (unit.toUpperCase()) {
    case "MINUTE":
      res = 60 * times;
      break;
    case "HOUR":
      res = 3600 * times;
      break;
    case "DAY":
      res = 86400 * times;
      break;
    case "WEEK":
      res = 86400 * times * 7;
      break;
    case "MONTH":
      res = 86400 * times * 30 * 7;
      break;
    default:
      throw new Error("Invalid option for seconds");
  }

  return res;
};
