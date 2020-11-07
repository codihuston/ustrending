const Joi = require("joi");

module.exports = {
  point: Joi.object({
    long: Joi.number(),
    lat: Joi.number(),
  }),
};
