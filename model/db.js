const { Pool } = require("pg");
const fs = require("fs");

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
    if(err.code == '23505') {
      return 23505 // violate unique constraint
    }
    return err;
  } finally {
    const duration = Date.now() - start;
    console.log("executed query:", {
      query: text,
      duration: `${duration}ms`,
      rows: `${query != undefined ? query.rowCount : 'error'}` ,
    });
    fs.appendFileSync(
      "queries_log.log",
      `executed query: { query: ${text}, params: ${params}; duration: ${duration}ms, rows: ${query != undefined ? query.rowCount : 'error'} }\n`
    );
    client.release();
  }
  return query;
}

module.exports = { query };
