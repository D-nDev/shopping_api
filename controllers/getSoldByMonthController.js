const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const month = req.query.month;
    if (!month) {
      res.status(400).send("You should provide a month");
    } else if (month < 1 || month > 12) {
      res.status(400).send("Month should be between 1 and 12");
    } else {
      try {
        const sales = await db.query(
          `
      SELECT sales.product_id,
        prd.name,
        prd.description,
        count(sales.sold_amount) AS quantity_sold,
        date_part('month'::text, hrd.creation_timestamp) AS month,
        max(sales.total) AS high_sale,
        avg(sales.total) AS average,
        sum(sales.total) AS total_month,
        max(sales.unitary_value) AS high_unitary,
        avg(sales.unitary_value) AS average_unitary
      FROM sale_items sales
        JOIN products prd ON sales.product_id = prd.id
        JOIN sale_header hrd ON sales.sale_header_id = hrd.id
        WHERE date_part('month'::text, hrd.creation_timestamp) = $1
      GROUP BY sales.product_id, prd.name, prd.description, (date_part('month'::text, hrd.creation_timestamp));
      `,
          [month]
        );
        if (sales.rows.length <= 0) {
          res.status(404).send("You don't have sales in this month");
        } else {
          res.status(200).send(sales.rows);
        }
      } catch (err) {
        console.log(err);
        res.status(500).send("Error, contact the administrator");
      }
    }
  },
};
