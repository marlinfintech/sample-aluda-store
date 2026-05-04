// ===============================
// VIEW MORE / SHOW LESS PRODUCTS
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const cards = document.querySelectorAll(".categoryproductscard");

  cards.forEach(card => {

    const products = card.querySelectorAll(".productcard");
    const btn = card.parentElement.querySelector(".viewbutton");

    if (!btn || products.length === 0) return;

    // Hide everything after 4
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

      btn.textContent = expanded
        ? "Show Less"
        : "View More Products";
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

  // Prevent menu from closing when clicking icon
  menuIcon.addEventListener("click", e => e.stopPropagation());

  // Close menu when a link is clicked
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.checked = false;
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (menuToggle.checked && !menuContainer.contains(event.target)) {
      setTimeout(() => {
        menuToggle.checked = false;
      }, 10);
    }
  });

});


document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".productcard").forEach(card => {

    const container = card.querySelector(".placeorder");

    const orderBtn = card.querySelector(".orderbutton");
    const cancelBtn = card.querySelector(".cancelbutton");

    const stockLabel = card.querySelector(".instocklabel");

    const orderPlaced = card.querySelector(".orderplaced");

    const orderSection = card.querySelector(".ordersection");

    // ORDER CLICK → SWITCH STATE
    orderBtn.addEventListener("click", () => {

      container.classList.remove("placeorder");
      container.classList.add("orderplaced");

      orderSection.style.display = "none";
      orderPlaced.style.display = "flex";

    });

    // CANCEL CLICK → REVERT STATE
    cancelBtn.addEventListener("click", () => {

      container.classList.remove("orderplaced");
      container.classList.add("placeorder");

      stockLabel.textContent = "In Stock";
      stockLabel.style.color = "black";

      orderSection.style.display = "flex";
      orderPlaced.style.display = "none";

    });

  });

});

