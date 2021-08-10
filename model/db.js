const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "123456",
  port: 5432,
});

async function query(text, params) {
  const start = Date.now();
  const client = await pool.connect();
  let query;
  try {
    query = await client.query(text, params);
  } catch (err) {
    console.log(err);
    return err;
  } finally {
    const duration = Date.now() - start;
    console.log("executed query:", { query: text, duration: `${duration}ms`, rows: query.rowCount });
    client.release();
  }
  return query;
}

module.exports = { query };
