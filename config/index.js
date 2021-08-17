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
};
