const Joi = require("joi");

/**
 * Validates the request URL params against the given schema
 * @param {*} schema
 */
module.exports = (property, schema) => {
  return (req, res, next) => {
    if (!req[property]) {
      next(
        new Error(
          `Validation failure: property '${property} does not exist on the request object!'`
        )
      );
    }
    // validate the request
    else {
      const { error } = schema.validate(req[property]);
      const isValid = error == null;

      if (isValid) {
        next();
      } else {
        const { details } = error;
        const message = details.map((i) => i.message).join(",");

        console.log("error", message);
        res.status(422).json({ error: message });
      }
    }
  };
};
