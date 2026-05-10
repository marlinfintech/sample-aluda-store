document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const menuContainer = document.querySelector(".menu-container");
  const menuLinks = document.querySelectorAll(".dropdown-menu a");
  const menuIcon = document.querySelector(".menu-icon");

  // Prevent icon click from closing menu
  menuIcon.addEventListener("click", e => e.stopPropagation());

  // Close menu when clicking links
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.checked = false;
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (menuToggle.checked && !menuContainer.contains(event.target)) {
      setTimeout(() => menuToggle.checked = false, 10);
    }
  });
});


// ===============================
// STATE
// ===============================
let cart = {};
let inventory = [];


// ===============================
// LOAD DATA
// ===============================
async function loadData() {
  try {
    const invRes = await fetch("http://localhost:3000/inventory");
    inventory = await invRes.json();

    cart = JSON.parse(localStorage.getItem("cart")) || {};

    renderCart();

  } catch (err) {
    console.error(err);
    alert("Failed to load checkout data");
  }
}


// ===============================
// RENDER CART
// ===============================
function renderCart() {
  const table = document.getElementById("cartTable");
  table.innerHTML = "";

  let total = 0;

  for (let code in cart) {
    const qty = Number(cart[code]) || 0;
if (qty <= 0) continue;

    const product = inventory.find(p => String(p.item_code) === String(code));
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

      <td>${price}</td>
      <td>${subtotal.toFixed(2)}</td>

      <td>
        <button class="removeBtn" onclick="removeItem('${code}')">
          Remove
        </button>
      </td>
    `;

    table.appendChild(row);
  }

  document.getElementById("totalBox").textContent =
    "TOTAL : " + total.toFixed(2);
}


// ===============================
// CHANGE QUANTITY (+ / -)
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
// BACK BUTTON
// ===============================
function goBack() {
  window.location.href = "index.html";
}


// ===============================
// CONFIRM ORDER (CHECKOUT)
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

    alert("Order Placed Successfully !");

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