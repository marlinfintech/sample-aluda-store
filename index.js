// ===============================
// CART STATE (PERSISTENT)
// ===============================
let cart = JSON.parse(localStorage.getItem("cart")) || {};

// save cart helper
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}


// ===============================
// VIEW MORE / SHOW LESS PRODUCTS
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".categoryproductscard").forEach(card => {

    const products = card.querySelectorAll(".productcard");
    const btn = card.parentElement.querySelector(".viewbutton");

    if (!btn || products.length === 0) return;

    products.forEach((product, i) => {
      if (i >= 4) product.classList.add("hidden");
    });

    let expanded = false;

    btn.addEventListener("click", () => {

      expanded = !expanded;

      products.forEach((product, i) => {
        if (i >= 4) {
          product.classList.toggle("hidden", !expanded);
        }
      });

      btn.textContent = expanded ? "Show Less" : "View More Products";
    });

  });

});


// ===============================
// MENU TOGGLE BEHAVIOR
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
// CART + ORDER SYSTEM
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".productcard").forEach(card => {

    const orderBtn = card.querySelector(".orderbutton");
    const cancelBtn = card.querySelector(".cancelbutton");

    const orderSection = card.querySelector(".ordersection");
    const orderPlaced = card.querySelector(".orderplaced");

    const stockLabel = card.querySelector(".instocklabel");
    const code = card.querySelector(".productimage")?.dataset.item_code;

    if (!orderBtn || !cancelBtn || !code) return;

    if (cart[code]) {
      orderSection.style.display = "none";
      orderPlaced.style.display = "flex";
      if (stockLabel) stockLabel.style.display = "none";
    }

    // ADD TO CART
    orderBtn.addEventListener("click", () => {

      cart[code] = (cart[code] || 0) + 1;
      saveCart();
      updateCartUI();

      orderSection.style.display = "none";
      orderPlaced.style.display = "flex";

      if (stockLabel) stockLabel.style.display = "none";
    });

    // REMOVE FROM CART
    cancelBtn.addEventListener("click", () => {

      if (cart[code]) {
        cart[code]--;
        if (cart[code] <= 0) delete cart[code];
      }

      saveCart();
      updateCartUI();

      orderSection.style.display = "flex";
      orderPlaced.style.display = "none";

      if (stockLabel) stockLabel.style.display = "block";
    });

  });

});


// ===============================
// CART UI COUNTER
// ===============================
function updateCartUI() {

  const total = Object.values(cart).reduce((a, b) => a + b, 0);

  let badge = document.getElementById("cart-count");

  const checkoutBtn = document.querySelector(".checkoutbutton");
  if (!checkoutBtn) return;

  if (!badge) {
    badge = document.createElement("span");
    badge.id = "cart-count";
    badge.style.marginLeft = "6px";
    badge.style.fontWeight = "bold";
    checkoutBtn.appendChild(badge);
  }

  badge.textContent = total;
}

updateCartUI();


// ===============================
// INVENTORY LOADER
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  try {

    const res = await fetch("http://localhost:3000/inventory");
    if (!res.ok) return;

    const inventory = await res.json();

    document.querySelectorAll(".productcard").forEach(card => {

      const img = card.querySelector(".productimage");
      const code = img?.dataset.item_code;

      if (!code) return;

      const product = inventory.find(p => p.item_code === code);

      const stockLabel = card.querySelector(".instocklabel");
      const orderBtn = card.querySelector(".orderbutton");

      if (!product) return;

      if (product.stock_available <= 0) {

        stockLabel.textContent = "Out of Stock";
        stockLabel.style.color = "#EE0000";

        orderBtn.disabled = true;
        orderBtn.textContent = "Unavailable";
        orderBtn.style.opacity = "0.2";

      } else {

        stockLabel.textContent = "In Stock";
        stockLabel.style.color = "#000000";

        orderBtn.disabled = false;
        orderBtn.textContent = "Order";
        orderBtn.style.opacity = "1";

      }

    });

  } catch (err) {
    console.error("Inventory load error:", err);
  }

});


// ===============================
// CHECKOUT BUTTON (FIXED FLOW)
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const checkoutBtn = document.querySelector(".checkoutbutton");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async () => {

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

     // alert("Order placed successfully!");

      // ❗ FIX: DO NOT clear cart here
      // keep it so checkout.html can read it

      window.location.href = "checkout.html";

    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }

  });

});