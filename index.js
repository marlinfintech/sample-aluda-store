// ===============================
// SUPABASE CONNECTION (USE EXISTING CLIENT)
// ===============================
const db = window.supabaseClient;


// ===============================
// CART STATE (PERSISTENT)
// ===============================
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let inventory = [];


// ===============================
// SAVE CART HELPER
// ===============================
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}


// ===============================
// LOAD INVENTORY FROM SUPABASE
// ===============================
async function loadInventory() {
  const { data, error } = await db
    .from("inventory")
    .select("*");

  if (error) {
    console.error("Inventory load error:", error);
    return;
  }

  inventory = data || [];
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
// CART SYSTEM (ADD / REMOVE)
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
// CART COUNTER UI
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
// INVENTORY + STOCK CHECK
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  await loadInventory();

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

});


// ===============================
// CHECKOUT (SUPABASE)
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

      const { data: order, error: orderError } = await db
        .from("orders")
        .insert([{ total_amount: 0 }])
        .select()
        .single();

      if (orderError) throw orderError;

      let total = 0;

      for (let code in cart) {

        const qty = cart[code];

        const product = inventory.find(p => p.item_code === code);
        if (!product) continue;

        const subtotal = product.price * qty;
        total += subtotal;

        await db.from("order_items").insert([{
          order_id: order.id,
          item_code: code,
          item_name: product.item_name,
          quantity: qty,
          price: product.price,
          subtotal: subtotal
        }]);

        await db
          .from("inventory")
          .update({
            stock_available: product.stock_available - qty
          })
          .eq("item_code", code);
      }

      await db
        .from("orders")
        .update({ total_amount: total })
        .eq("id", order.id);

      alert("Order placed successfully!");

      cart = {};
      localStorage.removeItem("cart");

      window.location.href = "checkout.html";

    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }

  });

});