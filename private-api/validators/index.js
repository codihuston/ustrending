const Joi = require("joi");

module.exports = {
  woeid: Joi.object({
    woeid: Joi.number(),
  }),
};
