/* =========================================================
   GAMENEW - HERO SLIDER
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector(".hero-slider");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".slide"));
    const dots = Array.from(slider.querySelectorAll(".slider-dots .dot"));
    const prev = slider.querySelector(".slider-prev");
    const next = slider.querySelector(".slider-next");
    if (slides.length < 2) return;

    let current = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("active");
    }));
    let timer = null;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === current);
            slide.setAttribute("aria-hidden", i === current ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === current);
            dot.setAttribute("aria-current", i === current ? "true" : "false");
        });
    }

    function stopAuto() { if (timer) window.clearInterval(timer); }
    function startAuto() {
        stopAuto();
        timer = window.setInterval(function () { showSlide(current + 1); }, 6000);
    }

    if (prev) prev.addEventListener("click", function () { showSlide(current - 1); startAuto(); });
    if (next) next.addEventListener("click", function () { showSlide(current + 1); startAuto(); });
    dots.forEach(function (dot, i) {
        dot.setAttribute("role", "button");
        dot.setAttribute("tabindex", "0");
        dot.addEventListener("click", function () { showSlide(i); startAuto(); });
        dot.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault(); showSlide(i); startAuto();
            }
        });
    });

    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);
    slider.addEventListener("focusin", stopAuto);
    slider.addEventListener("focusout", startAuto);
    showSlide(current);
    startAuto();
});
