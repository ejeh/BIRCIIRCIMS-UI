const hamburger = document.querySelector(".hamburger");
const link = document.querySelector(".nav-left");
hamburger.addEventListener("click", function () {
  link.classList.toggle("show-link");
});

const navListItems = document.querySelectorAll(".nav-list-item");

navListItems.forEach((item) => {
  item.addEventListener("click", function () {
    link.classList.remove("show-link");
  });
});

function toggleFAQ(faqId) {
  const faqBody = document.getElementById(faqId);
  faqBody.classList.toggle("show-faq-body");
  // Change the icon based on whether the FAQ body is visible or not
  //   icon.src = faqBody.classList.contains("show-faq-body")
  //     ? "./assets/expand_less.png"
  //     : "./assets/expand_more.png";
}

function updateButtonState() {
  const termsCheckbox = document.getElementById("termsCheckbox");
  const submitButton = document.getElementById("submitButton");

  submitButton.disabled = !termsCheckbox.checked;
}

function submitForm() {
  alert("Form submitted successfully!");
  // Add additional form submission logic here
}
