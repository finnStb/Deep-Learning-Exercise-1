// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Toggle mobile menu visibility
  const menuButton = document.querySelector(".mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden"); // Toggle mobile navigation visibility
  });

  // Scroll to sections when clicking on anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const navHeight = document.querySelector("nav").offsetHeight; // Dynamic height of the navigation bar
      const targetElement = document.querySelector(this.getAttribute("href"));
      const offsetTop = targetElement.offsetTop;

      window.scrollTo({
        top: offsetTop - navHeight, // Use dynamic height for the offset
        behavior: "smooth",
      });
    });
  });
});
