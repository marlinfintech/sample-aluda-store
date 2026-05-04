const express = require("express");
const http = require("http");
const { Pool } = require("pg");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ===============================
// DATABASE CONNECTION
// ===============================
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ecommerce",
  password: "samir",
  port: 5432
});

// ===============================
// HTTP + WS SERVER
// ===============================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ===============================
// BROADCAST FUNCTION
// ===============================
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// ===============================
// GET INVENTORY
// ===============================
app.get("/inventory", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// ===============================
// SINGLE ITEM CHECKOUT (optional legacy)
// ===============================
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

    const updated = result.rows[0];

    broadcast({
      type: "STOCK_UPDATE",
      product: updated
    });

    res.json({ success: true, product: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ===============================
// CART CHECKOUT (REAL SYSTEM)
// ===============================
app.post("/checkout-cart", async (req, res) => {

  const { cart } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of cart) {

      const result = await client.query(
        `UPDATE inventory
         SET stock_available = stock_available - $1
         WHERE item_code = $2 AND stock_available >= $1
         RETURNING *`,
        [item.quantity, item.item_code]
      );

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.json({
          success: false,
          message: `Insufficient stock for ${item.item_code}`
        });
      }

      const updated = result.rows[0];

      // broadcast live update
      broadcast({
        type: "STOCK_UPDATE",
        product: updated
      });
    }

    await client.query("COMMIT");

    res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ success: false });

  } finally {
    client.release();
  }
});

// ===============================
// WEBSOCKET CONNECTION
// ===============================
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");
});

// ===============================
// START SERVER
// ===============================
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});