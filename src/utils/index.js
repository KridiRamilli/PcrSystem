const { logger } = require('./logging');
const { getAge, calcDate, generatePDF } = require('./utils');

module.exports = {
  logger,
  getAge,
  calcDate,
  generatePDF,
};
