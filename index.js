// ===============================
// VIEW MORE / SHOW LESS PRODUCTS
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const cards = document.querySelectorAll(".categoryproductscard");

  cards.forEach(card => {

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

  menuIcon.addEventListener("click", e => e.stopPropagation());

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.checked = false;
    });
  });

  document.addEventListener("click", (event) => {
    if (menuToggle.checked && !menuContainer.contains(event.target)) {
      setTimeout(() => {
        menuToggle.checked = false;
      }, 10);
    }
  });

});


// ===============================
// ORDER BUTTON TOGGLE SYSTEM (KEPT SIMPLE & STABLE)
// placeorder ↔ orderplaced ONLY
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".productcard").forEach(card => {

    const orderBtn = card.querySelector(".orderbutton");
    const cancelBtn = card.querySelector(".cancelbutton");

    const orderSection = card.querySelector(".ordersection");
    const orderPlaced = card.querySelector(".orderplaced");

    const stockLabel = card.querySelector(".instocklabel");

    orderBtn.addEventListener("click", () => {

      orderSection.style.display = "none";
      orderPlaced.style.display = "flex";

      // hide stock when added to cart
      if (stockLabel) {
        stockLabel.style.display = "none";
      }

    });

    cancelBtn.addEventListener("click", () => {

      orderSection.style.display = "flex";
      orderPlaced.style.display = "none";

      // restore stock label
      if (stockLabel) {
        stockLabel.style.display = "block";
      }

    });

  });

});


// ===============================
// INVENTORY LOADER + STOCK DISPLAY
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  try {

    const res = await fetch("http://localhost:3000/inventory");

    if (!res.ok) {
      console.error("Inventory API failed");
      return;
    }

    const inventory = await res.json();

    document.querySelectorAll(".productcard").forEach(card => {

      const img = card.querySelector(".productimage");
      const code = img?.dataset.item_code;

      if (!code) return;

      const product = inventory.find(p => p.item_code === code);

      const stockLabel = card.querySelector(".instocklabel");
      const orderBtn = card.querySelector(".orderbutton");

      if (!product) return;

      // OUT OF STOCK
      if (product.stock_available <= 0) {

        stockLabel.textContent = "Out of Stock";
        stockLabel.style.color = "red";

        orderBtn.disabled = true;
        orderBtn.textContent = "Unavailable";
        orderBtn.style.opacity = "0.5";

      } 
      // IN STOCK
      else {

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