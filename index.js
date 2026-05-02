





document.addEventListener("DOMContentLoaded", () => {

  const cards = document.querySelectorAll(".categoryproductscard");

  cards.forEach(card => {

    const products = card.querySelectorAll(".productcard");
    const btn = card.parentElement.querySelector(".viewbutton");

    if (!btn || products.length === 0) return;

    // hide everything after 4
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





document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const menuContainer = document.querySelector(".menu-container");
  const menuLinks = document.querySelectorAll(".dropdown-menu a");
  const menuIcon = document.querySelector(".menu-icon");

  // Stop click on icon from closing menu
  menuIcon.addEventListener("click", e => e.stopPropagation());

  // Close menu when a link is clicked
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.checked = false;
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    // Only close if the click is outside and checkbox is open
    if (menuToggle.checked && !menuContainer.contains(event.target)) {
      // Use a small delay to avoid conflict with checkbox toggle
      setTimeout(() => menuToggle.checked = false, 10);}});});
