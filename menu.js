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
      setTimeout(() => menuToggle.checked = false, 10);
    }
  });
});
