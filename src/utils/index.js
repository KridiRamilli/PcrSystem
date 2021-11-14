const { logger } = require('./logging');
const { getAge, calcDate, generatePDF, missingData } = require('./utils');

module.exports = {
  logger,
  getAge,
  calcDate,
  generatePDF,
  missingData,
};
