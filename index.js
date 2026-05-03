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


// ===============================
// ORDER BUTTON TOGGLE SYSTEM
// ===============================
document.addEventListener("click", (e) => {

  // ORDER CLICK
  if (e.target.classList.contains("order-btn")) {
    const section = e.target.closest(".order-section");

    section.querySelector(".order-btn").classList.add("hidden");
    section.querySelector(".after-order").classList.remove("hidden");
  }

  // CANCEL CLICK
  if (e.target.classList.contains("cancel-btn")) {
    const section = e.target.closest(".order-section");

    section.querySelector(".after-order").classList.add("hidden");
    section.querySelector(".order-btn").classList.remove("hidden");
  }

});