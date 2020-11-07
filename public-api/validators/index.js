const Joi = require("joi");

module.exports = {
  point: Joi.object({
    long: Joi.number(),
    lat: Joi.number(),
  }),
  zip: Joi.object({
    // leave as number for now w/ no limit, in case I want to expand outreach
    zip: Joi.number(),
  }),
};
