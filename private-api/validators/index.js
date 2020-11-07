const Joi = require("joi");

module.exports = {
  get: {
    "places/nearest/point": Joi.object({
      long: Joi.number(),
      lat: Joi.number(),
    }),
  },
};
