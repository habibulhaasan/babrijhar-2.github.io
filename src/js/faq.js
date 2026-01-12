// FAQ Accordation Script

document.addEventListener("DOMContentLoaded", function() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      question.addEventListener("click", function() {
        // Toggle active class on the question
        question.classList.toggle("active");

        // Toggle show class on the answer
        answer.classList.toggle("show");

        // Rotate the arrow icon
        const arrow = question.querySelector(".arrow");
        arrow.style.transform = arrow.style.transform === "rotate(180deg)" ? "rotate(0)" : "rotate(180deg)";

        // Close other answers
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.querySelector(".faq-question").classList.remove("active");
            otherItem.querySelector(".faq-answer").classList.remove("show");
            otherItem.querySelector(".arrow").style.transform = "rotate(0)";
          }
        });
      });
    });
  });
