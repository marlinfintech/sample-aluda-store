let cart = {};
let inventory = [];


// ===============================
// LOAD DATA
// ===============================
async function loadData() {
  try {
    const invRes = await fetch("http://localhost:3000/inventory");
    inventory = await invRes.json();

    // FIX: use same cart source as index page
    cart = JSON.parse(localStorage.getItem("cart")) || {};

    renderCart();

  } catch (err) {
    console.error(err);
    alert("Failed to load checkout data");
  }
}


// ===============================
// RENDER TABLE
// ===============================
function renderCart() {

  const table = document.getElementById("cartTable");
  table.innerHTML = "";

  let total = 0;

  for (let code in cart) {

    const qty = cart[code];

    // FIX: type-safe match
    const product = inventory.find(p => String(p.item_code) === String(code));

    if (!product) continue;

    const price = Number(product.price);
    const subtotal = price * qty;
    total += subtotal;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${code}</td>
      <td>${qty}</td>
      <td>${price}</td>
      <td>${subtotal.toFixed(2)}</td>
      <td>
        <button class="removeBtn" onclick="removeItem('${code}')">Remove</button>
      </td>
    `;

    table.appendChild(row);
  }

  document.getElementById("totalBox").textContent =
    "Total: " + total.toFixed(2);
}


// ===============================
// REMOVE ITEM
// ===============================
function removeItem(code) {
  delete cart[code];
  renderCart();
}


// ===============================
// BACK BUTTON
// ===============================
function goBack() {
  window.location.href = "index.html";
}


// ===============================
// CONFIRM ORDER
// ===============================
async function confirmOrder() {

  if (Object.keys(cart).length === 0) {
    alert("Cart is empty");
    return;
  }

  try {

    const res = await fetch("http://localhost:3000/checkout-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Checkout failed");
      return;
    }

    alert("Purchase successful!");

    // clear cart AFTER successful checkout
    cart = {};
    localStorage.removeItem("cart");

    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}


// ===============================
// INIT
// ===============================
loadData();