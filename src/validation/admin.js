const joi = require('joi');

const bestProfessionValidation = joi.object({
  start: joi.date().iso().required(),
  end: joi.date().iso().min(joi.ref('start')).required(),
});

const bestClientsValidation = joi.object({
  start: joi.date().iso().required(),
  end: joi.date().iso().min(joi.ref('start')).required(),
  limit: joi.number().integer().greater(0),
});

module.exports = { bestProfessionValidation, bestClientsValidation };
