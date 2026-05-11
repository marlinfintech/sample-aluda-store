// ===============================
// SUPABASE CONNECTION (USE EXISTING CLIENT)
// ===============================
const db = window.supabaseClient;


// ===============================
// STATE
// ===============================
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let inventory = [];


// ===============================
// MENU TOGGLE
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menu-toggle");
  const menuContainer = document.querySelector(".menu-container");
  const menuLinks = document.querySelectorAll(".dropdown-menu a");
  const menuIcon = document.querySelector(".menu-icon");

  if (!menuToggle || !menuContainer || !menuIcon) return;

  menuIcon.addEventListener("click", e => e.stopPropagation());

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.checked = false;
    });
  });

  document.addEventListener("click", (event) => {
    if (menuToggle.checked && !menuContainer.contains(event.target)) {
      setTimeout(() => menuToggle.checked = false, 10);
    }
  });

});


// ===============================
// LOAD INVENTORY
// ===============================
async function loadInventory() {

  const { data, error } = await db
    .from("inventory")
    .select("*");

  if (error) {
    console.error("Inventory load error:", error);
    alert("Failed to load inventory");
    return;
  }

  inventory = data || [];
}


// ===============================
// INIT PAGE
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadInventory();
  renderCart();
});


// ===============================
// RENDER CART TABLE
// ===============================
function renderCart() {

  const table = document.getElementById("cartTable");
  if (!table) return;

  table.innerHTML = "";

  let total = 0;

  for (let code in cart) {

    const qty = Number(cart[code]);
    if (!qty) continue;

    const product = inventory.find(p => p.item_code === code);
    if (!product) continue;

    const price = Number(product.price);
    const subtotal = price * qty;

    total += subtotal;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${code}</td>

      <td>
        <button onclick="changeQty('${code}', 1)">+</button>
        <span style="margin: 0 10px;">${qty}</span>
        <button onclick="changeQty('${code}', -1)">-</button>
      </td>

      <td>${price.toFixed(2)}</td>
      <td>${subtotal.toFixed(2)}</td>

      <td>
        <button onclick="removeItem('${code}')" class="removeBtn">
          Remove
        </button>
      </td>
    `;

    table.appendChild(row);
  }

  const totalBox = document.getElementById("totalBox");
  if (totalBox) {
    totalBox.textContent = "TOTAL: " + total.toFixed(2);
  }
}


// ===============================
// CHANGE QUANTITY
// ===============================
function changeQty(code, delta) {

  if (!cart[code]) return;

  cart[code] += delta;

  if (cart[code] <= 0) {
    delete cart[code];
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}


// ===============================
// REMOVE ITEM
// ===============================
function removeItem(code) {

  delete cart[code];

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}


// ===============================
// GO BACK
// ===============================
function goBack() {
  window.location.href = "index.html";
}


// ===============================
// CONFIRM ORDER (SUPABASE)
// ===============================
async function confirmOrder() {

  if (Object.keys(cart).length === 0) {
    alert("Cart is empty");
    return;
  }

  try {

    // 1. Create order
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert([{ total_amount: 0 }])
      .select()
      .single();

    if (orderError) throw orderError;

    let total = 0;

    // 2. Process cart items
    for (let code in cart) {

      const qty = cart[code];

      const product = inventory.find(p => p.item_code === code);
      if (!product) continue;

      const subtotal = product.price * qty;
      total += subtotal;

      // Insert order items
      await db.from("order_items").insert([{
        order_id: order.id,
        item_code: code,
        item_name: product.item_name,
        quantity: qty,
        price: product.price,
        subtotal: subtotal
      }]);

      // Update stock
      await db
        .from("inventory")
        .update({
          stock_available: product.stock_available - qty
        })
        .eq("item_code", code);
    }

    // 3. Update order total
    await db
      .from("orders")
      .update({ total_amount: total })
      .eq("id", order.id);

    alert("Order placed successfully ! However, this is just a Sample Store by Marlin Fintech : )");

    cart = {};
    localStorage.removeItem("cart");

    window.location.href = "index.html";

  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed");
  }
}