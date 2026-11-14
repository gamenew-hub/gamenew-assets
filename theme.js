
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // تشخیص صفحه اصلی و صفحه اختصاصی مطلب
    const isPostPage = /^\/post\/\d+/i.test(window.location.pathname);

    document.body.classList.toggle("is-post-page", isPostPage);

    // مدیریت تصاویر مطالب
    document.querySelectorAll(".game-post").forEach(function (post) {
        const content = post.querySelector(".post-excerpt");
        const imageBox = post.querySelector(".post-image");

        if (!content || !imageBox) return;

        // در صفحه اختصاصی، تصاویر داخل متن دست‌نخورده باقی بمانند
        if (isPostPage) {
            post.classList.add("is-full-post");
            return;
        }

        // در صفحه اصلی، اولین تصویر به تصویر شاخص تبدیل شود
        const firstImage = content.querySelector("img");

        if (!firstImage) return;

        const imageUrl = firstImage.getAttribute("src");

        if (!imageUrl) return;

        if (imageBox.querySelector(".post-cover-image")) return;

        const cover = document.createElement("img");

        cover.className = "post-cover-image";
        cover.src = imageUrl;
        cover.alt = "";
        cover.loading = "lazy";
        cover.decoding = "async";

        imageBox.prepend(cover);
        imageBox.classList.add("has-cover");

        // تصویر شاخص از متن کارت حذف شود
        firstImage.remove();
    });

    // دکمه بازگشت به بالا
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

    // مدیریت لینک‌های خارجی
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
            // لینک‌های نامعتبر بدون تغییر باقی می‌مانند
        }
    });
});


/* =========================================
   GAMENEW - FULL ARCHIVE AUTOCOMPLETE
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const searchArea = document.querySelector(".header-search");
    const searchForm = searchArea?.querySelector("form");
    const searchInput = searchForm?.querySelector('input[name="q"]');

    if (!searchArea || !searchForm || !searchInput) return;

    const BLOG_HOST = "gamenew.blogfa.com";
    const ARCHIVE_PAGES = 6;

    const posts = [];
    const seen = new Set();

    let archiveLoaded = false;
    let archivePromise = null;
    let activeIndex = -1;
    let currentResults = [];

    function normalize(value) {
        return value
            .toLowerCase()
            .replace(/[يى]/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/\s+/g, " ")
            .trim();
    }

    function addPost(title, url) {
        title = (title || "").replace(/\s+/g, " ").trim();

        if (!title || !url) return;

        try {
            const parsedUrl = new URL(url, window.location.origin);

            if (parsedUrl.hostname !== BLOG_HOST) return;
            if (!/^\/post\/\d+(?:\/|$)/.test(parsedUrl.pathname)) return;

            const cleanUrl = parsedUrl.origin + parsedUrl.pathname;

            if (seen.has(cleanUrl)) return;

            seen.add(cleanUrl);
            posts.push({
                title: title,
                url: cleanUrl
            });
        } catch (error) {}
    }

    // مطالب موجود در صفحه فعلی
    document.querySelectorAll('a[href*="/post/"]').forEach(function (link) {
        addPost(link.textContent, link.href);
    });

    // کادر پیشنهادها
    const suggestionBox = document.createElement("div");
    suggestionBox.className = "search-suggestions";
    suggestionBox.setAttribute("role", "listbox");
    suggestionBox.hidden = true;

    searchArea.appendChild(suggestionBox);

    function closeSuggestions() {
        suggestionBox.hidden = true;
        suggestionBox.innerHTML = "";
        activeIndex = -1;
        currentResults = [];
        searchInput.removeAttribute("aria-activedescendant");
    }

    function updateActiveItem() {
        const items = suggestionBox.querySelectorAll(".search-suggestion");

        items.forEach(function (item, index) {
            item.classList.toggle("active", index === activeIndex);
            item.setAttribute(
                "aria-selected",
                index === activeIndex ? "true" : "false"
            );
        });

        if (activeIndex >= 0 && items[activeIndex]) {
            searchInput.setAttribute(
                "aria-activedescendant",
                items[activeIndex].id
            );
        } else {
            searchInput.removeAttribute("aria-activedescendant");
        }
    }

    function showSuggestions(query) {
        const term = normalize(query);

        closeSuggestions();

        if (term.length < 2) return;

        currentResults = posts
            .filter(function (post) {
                return normalize(post.title).includes(term);
            })
            .slice(0, 6);

        if (!currentResults.length) return;

        currentResults.forEach(function (post, index) {
            const item = document.createElement("button");

            item.type = "button";
            item.className = "search-suggestion";
            item.id = "game-search-option-" + index;
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", "false");
            item.textContent = post.title;

            item.addEventListener("click", function () {
                window.location.href = post.url;
            });

            suggestionBox.appendChild(item);
        });

        suggestionBox.hidden = false;
    }

    // دریافت تمام صفحات آرشیو بلاگفا
    function loadFullArchive() {
        if (archiveLoaded) return Promise.resolve();

        if (archivePromise) return archivePromise;

        if (window.location.hostname !== BLOG_HOST) {
            return Promise.resolve();
        }

        const requests = [];

        for (let page = 1; page <= ARCHIVE_PAGES; page++) {
            const url = page === 1
                ? "/posts/"
                : "/posts/?p=" + page;

            requests.push(
                fetch(url, {
                    credentials: "same-origin"
                })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Archive page unavailable");
                    }

                    return response.text();
                })
                .then(function (html) {
                    const doc = new DOMParser().parseFromString(
                        html,
                        "text/html"
                    );

                    doc.querySelectorAll('a[href*="/post/"]').forEach(
                        function (link) {
                            addPost(link.textContent, link.href);
                        }
                    );
                })
                .catch(function (error) {
                    console.warn("GameNew archive page error:", error);
                })
            );
        }

        archivePromise = Promise.all(requests).then(function () {
            archiveLoaded = true;

            showSuggestions(searchInput.value);
        });

        return archivePromise;
    }

    searchInput.setAttribute("autocomplete", "off");
    searchInput.setAttribute("role", "combobox");
    searchInput.setAttribute("aria-autocomplete", "list");
    searchInput.setAttribute("aria-expanded", "false");

    searchInput.addEventListener("input", function () {
        showSuggestions(searchInput.value);

        searchInput.setAttribute(
            "aria-expanded",
            String(!suggestionBox.hidden)
        );

        if (normalize(searchInput.value).length >= 2) {
            loadFullArchive();
        }
    });

    searchInput.addEventListener("keydown", function (event) {
        if (suggestionBox.hidden) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();

            activeIndex = Math.min(
                activeIndex + 1,
                currentResults.length - 1
            );

            updateActiveItem();
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            activeIndex = Math.max(activeIndex - 1, 0);

            updateActiveItem();
        }

        if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();

            window.location.href = currentResults[activeIndex].url;
        }

        if (event.key === "Escape") {
            closeSuggestions();
            searchInput.setAttribute("aria-expanded", "false");
        }
    });

    searchInput.addEventListener("blur", function () {
        window.setTimeout(function () {
            closeSuggestions();
            searchInput.setAttribute("aria-expanded", "false");
        }, 150);
    });

    searchInput.addEventListener("focus", function () {
        if (searchInput.value.trim().length >= 2) {
            showSuggestions(searchInput.value);
            loadFullArchive();

            searchInput.setAttribute(
                "aria-expanded",
                String(!suggestionBox.hidden)
            );
        }
    });

});

/* GAMENEW - DYNAMIC GENRE PAGE TITLE */
document.addEventListener("DOMContentLoaded", function () {
    const tagMatch = window.location.pathname.match(/^\/tag\/([^/]+)/);

    if (!tagMatch) return;

    const heading = document.querySelector(".section-heading h1");

    if (!heading) return;

    let genreName = decodeURIComponent(tagMatch[1])
        .replace(/-/g, " ");

    heading.textContent = "بازی‌های " + genreName;
});

/* GAMENEW - HIDE HERO SLIDER ON TAG PAGES */
document.addEventListener("DOMContentLoaded", function () {
    if (/^\/tag\//.test(window.location.pathname)) {
        const heroSlider = document.querySelector(".hero");

        if (heroSlider) {
            heroSlider.style.display = "none";
        }
    }
});


/* GAMENEW - ACTIVE GENRE DETECTION */

(function () {

    function setActiveGenre() {

        const currentPath = window.location.pathname.replace(/\/+$/, "");

        document.querySelectorAll(".genre-item").forEach(function (item) {

            const itemPath = new URL(item.href, window.location.origin)
                .pathname.replace(/\/+$/, "");

            if (itemPath === currentPath) {
                item.classList.add("is-active");
                item.setAttribute("aria-current", "page");
            }

        });

    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setActiveGenre);
    } else {
        setActiveGenre();
    }

})();
