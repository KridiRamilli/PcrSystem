const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const path = require('path');

const logger = winston.createLogger({
  format: combine(label({ label: 'PCR_SYSTEM' }), timestamp(), logFormat),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, `../../logs/errors.log`),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, `../../logs/info.log`),
      level: 'info',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}

module.exports = {
  logger,
};
