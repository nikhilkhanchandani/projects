const contactButton = document.getElementById("contactButton");
const contactForm = document.getElementById("contactForm");

contactButton.addEventListener("click", () => {
  contactForm.style.display =
    contactForm.style.display === "none" ? "block" : "none";
});
