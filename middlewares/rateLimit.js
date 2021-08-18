const rateLimit = require('express-rate-limit');
const config = require("@config");
const slowDown = require('express-slow-down');

const limiter = rateLimit({
  windowMs: config.request.rateLimit.window,
  max: config.request.rateLimit.max,
});

const slower = slowDown({
  windowMs: config.request.slowDown.window,
  delayAfter: config.request.slowDown.delayAfter,
  delayMs: config.request.slowDown.delayMs
})

module.exports = [
  limiter,
  slower
]