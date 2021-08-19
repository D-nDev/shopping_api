require("dotenv").config();
require("module-alias/register");

const { Pool } = require("pg");
const fs = require("fs");
const config = require("@config");

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
});

async function query(text, params) {
  const start = Date.now();
  try {
    const client = await pool.connect();
    let query;
    try {
      query = await client.query(text, params);
    } catch (err) {
      return err;
    } finally {
      const duration = Date.now() - start;
      fs.appendFileSync(
        "./logs/queries_log.log",
        `executed query: { query: ${text}, params: ${params}; duration: ${duration}ms, rows: ${
          query != undefined ? query.rowCount : "error"
        } }\n`
      );
      client.release();
    }
    return query;
  } catch (err) {
    fs.appendFileSync("./logs/connectionSQLFail.log", `${err}\n`);
    err = { rows: "Connection with PGSQL failed." };
    return err;
  }
}

module.exports = { query };
