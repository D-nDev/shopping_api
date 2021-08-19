const db = require("@model/db");

async function insertitems(saleheaderid, cart) {
  let errors = 0;
  for(const item of cart) {
    const eachitem = await db.query(
      "INSERT INTO sale_items (sale_header_id, line, product_id, delivery_method, sold_amount, unitary_value, discount_value, plus_value, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        saleheaderid,
        item.quantity,
        item.product_id,
        "Courier",
        item.quantity,
        item.unitary_price,
        item.discount_value,
        item.plus_value,
        item.total_price,
      ]
    );
    if(eachitem.severity) {
      errors += 1;
    }
  }
  return errors;
}

module.exports = { insertitems }