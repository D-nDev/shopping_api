require("dotenv").config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
  },

  database: {
    user: process.env.db_user,
    host: process.env.db_host,
    database: process.env.db_database,
    password: process.env.db_password,
    port: process.env.db_port,
  },

  request: {
    rateLimit: {
      window: 20 * 60 * 1000, // ms to minutes
      max: 150 // max requisitions in window
    },
    slowDown: {
      window: 15 * 60 * 1000, // after this(15 minutes) will slow down next requests
      delayAfter: 100, // delay after X requests in 15 minutes
      delayMs: 100 // will increase 100ms sequentially for each request after 100 requests in 15 minutes
    }
  }
};
