const joi = require('joi');

const depositValidation = joi.object({
  amount: joi.number().greater(0).precision(2).required(),
});

module.exports = { depositValidation };
