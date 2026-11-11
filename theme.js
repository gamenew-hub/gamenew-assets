/* =========================================================
   GAMENEW - THEME JS
   Compatible with Blogfa template output
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    // Back to top
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        const toggleBackToTop = function () {
            backToTop.classList.toggle("show", window.scrollY > 400);
        };
        window.addEventListener("scroll", toggleBackToTop, { passive: true });
        toggleBackToTop();
        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Identify full-post view and move the first content image into the cover.
    document.querySelectorAll(".game-post").forEach(function (post) {
        const content = post.querySelector(".post-excerpt");
        const imageBox = post.querySelector(".post-image");
        const readMore = post.querySelector(".read-more");
        if (!content) return;

        const isFullPost = !readMore;
        if (isFullPost) post.classList.add("is-full-post");

        if (!imageBox) return;
        const firstImage = content.querySelector("img");
        if (!firstImage) return;

        const imageUrl = firstImage.getAttribute("src");
        if (!imageUrl) return;

        // Prevent duplicate cover insertion if the script is accidentally loaded twice.
        if (!imageBox.querySelector(".post-cover-image")) {
            const cover = document.createElement("img");
            cover.src = imageUrl;
            cover.alt = "";
            cover.className = "post-cover-image";
            cover.loading = "lazy";
            imageBox.prepend(cover);
            imageBox.classList.add("has-cover");
        }

        // Keep the original image in the full article; remove it only from excerpts.
        if (!isFullPost) firstImage.remove();
    });

    // Mark page as ready for optional entrance effects.
    document.body.classList.add("theme-loaded");

    // Secure external links without overriding same-site navigation.
    document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach(function (link) {
        if (link.hostname && link.hostname !== window.location.hostname) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
    });
});
