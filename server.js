const express = require("express");
const http = require("http");
const { Pool } = require("pg");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// DATABASE CONNECTION
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ecommerce",
  password: "samir",
  port: 5432
});

// HTTP + WS SERVER
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// SAFE BROADCAST
function broadcast(data) {
  const msg = JSON.stringify(data);

  wss.clients.forEach(client => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    } catch (err) {
      console.error("WS error:", err);
    }
  });
}

// GET INVENTORY (UNCHANGED)
app.get("/inventory", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// LEGACY SINGLE CHECKOUT (KEEP SAFE)
app.post("/checkout", async (req, res) => {

  const { item_code } = req.body;

  try {
    const result = await pool.query(
      `UPDATE inventory
       SET stock_available = stock_available - 1
       WHERE item_code = $1 AND stock_available > 0
       RETURNING *`,
      [item_code]
    );

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Out of stock" });
    }

    broadcast({
      type: "STOCK_UPDATE",
      product: result.rows[0]
    });

    res.json({ success: true, product: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// CART CHECKOUT (NOW PERSISTENT SAFE CORE)
app.post("/checkout-cart", async (req, res) => {

  const cart = req.body.cart;

  if (!cart || Object.keys(cart).length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item_code in cart) {

      const quantity = cart[item_code];

      if (quantity <= 0) continue;

      // 1. Get product
      const productRes = await client.query(
        `SELECT * FROM inventory WHERE item_code = $1`,
        [item_code]
      );

      if (productRes.rowCount === 0) {
        throw new Error(`Product not found: ${item_code}`);
      }

      const product = productRes.rows[0];

      // 2. Update stock safely
      const updateRes = await client.query(
        `UPDATE inventory
         SET stock_available = stock_available - $1
         WHERE item_code = $2 AND stock_available >= $1
         RETURNING *`,
        [quantity, item_code]
      );

      if (updateRes.rowCount === 0) {
        throw new Error(`Insufficient stock for ${item_code}`);
      }

      // 3. Broadcast live update
      broadcast({
        type: "STOCK_UPDATE",
        product: updateRes.rows[0]
      });
    }

    await client.query("COMMIT");

    res.json({ success: true });

  } catch (err) {

    await client.query("ROLLBACK");

    console.error(err.message);

    res.status(400).json({
      success: false,
      error: err.message
    });

  } finally {
    client.release();
  }
});

// PERSISTENT ORDER HISTORY (NEW)
app.get("/orders", async (req, res) => {

  try {
    const orders = await pool.query(
      `SELECT * FROM orders ORDER BY id DESC`
    );

    const items = await pool.query(
      `SELECT * FROM order_items ORDER BY order_id DESC`
    );

    res.json({
      orders: orders.rows,
      items: items.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// WEBSOCKET CONNECTION
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");
});

// START SERVER
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});