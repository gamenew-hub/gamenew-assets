
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* استخراج تصویر شاخص مطالب */
    document.querySelectorAll(".game-post").forEach(function (post) {
        const content = post.querySelector(".post-excerpt");
        const imageBox = post.querySelector(".post-image");
        const readMore = post.querySelector(".read-more");

        if (!content || !imageBox) return;

        const isSummaryCard = Boolean(readMore);

        if (!isSummaryCard) {
            post.classList.add("is-full-post");
        }

        if (imageBox.querySelector(".post-cover-image")) return;

        const firstImage = content.querySelector("img");
        if (!firstImage) return;

        const imageUrl = firstImage.getAttribute("src");
        if (!imageUrl) return;

        const cover = document.createElement("img");
        cover.className = "post-cover-image";
        cover.src = imageUrl;
        cover.alt = "";
        cover.loading = "lazy";
        cover.decoding = "async";

        imageBox.prepend(cover);
        imageBox.classList.add("has-cover");

        if (isSummaryCard) {
            firstImage.remove();
        }
    });

    /* دکمه بازگشت به بالا */
    const backToTop = document.getElementById("backToTop");

    if (backToTop) {
        window.addEventListener("scroll", function () {
            backToTop.classList.toggle("show", window.scrollY > 400);
        }, { passive: true });

        backToTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    document.body.classList.add("theme-loaded");

    /* مدیریت لینک‌های خارجی */
    document.querySelectorAll("a[href]").forEach(function (link) {
        const href = link.getAttribute("href");

        if (!href || href.charAt(0) === "#") return;

        try {
            const url = new URL(href, window.location.href);

            if (
                (url.protocol === "http:" || url.protocol === "https:") &&
                url.hostname !== window.location.hostname
            ) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
            }
        } catch (error) {
            // لینک‌های نامعتبر بدون تغییر باقی می‌مانند.
        }
    });
});
