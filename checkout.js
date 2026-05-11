// ===============================
// SUPABASE CONNECTION
// ===============================
const supabaseUrl = "https://lssjpyikumgycgpmiqub.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2pweWlrdW1neWNncG1pcXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjY4MjUsImV4cCI6MjA5MzMwMjgyNX0.lu5mMuLrMO8pOpuPMwNx9paJkJRDrJu1BGX17cKqcX8";";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


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
// STATE
// ===============================
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let inventory = [];


// ===============================
// LOAD INVENTORY (SUPABASE)
// ===============================
async function loadInventory() {

  const { data, error } = await supabase
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
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await loadInventory();
  renderCart();
});


// ===============================
// RENDER CART
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
    totalBox.textContent = "TOTAL : " + total.toFixed(2);
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
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ total_amount: 0 }])
      .select()
      .single();

    if (orderError) throw orderError;

    let total = 0;

    // 2. Process cart
    for (let code in cart) {

      const qty = cart[code];

      const product = inventory.find(p => p.item_code === code);
      if (!product) continue;

      const subtotal = product.price * qty;
      total += subtotal;

      // insert order items
      await supabase.from("order_items").insert([{
        order_id: order.id,
        item_code: code,
        item_name: product.item_name,
        quantity: qty,
        price: product.price,
        subtotal: subtotal
      }]);

      // update stock
      await supabase
        .from("inventory")
        .update({
          stock_available: product.stock_available - qty
        })
        .eq("item_code", code);
    }

    // 3. update order total
    await supabase
      .from("orders")
      .update({ total_amount: total })
      .eq("id", order.id);

    alert("Order placed successfully!");

    cart = {};
    localStorage.removeItem("cart");

    window.location.href = "index.html";

  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed");
  }
}