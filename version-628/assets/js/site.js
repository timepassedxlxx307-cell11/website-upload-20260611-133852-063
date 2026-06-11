(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                startAutoPlay();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                startAutoPlay();
            });
        });

        carousel.addEventListener("mouseenter", stopAutoPlay);
        carousel.addEventListener("mouseleave", startAutoPlay);

        show(0);
        startAutoPlay();
    }

    function initImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll("[data-fallback-image]"));

        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                if (image.parentElement) {
                    image.parentElement.classList.add("image-missing");
                }
            }, { once: true });
        });
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-filter-list]");

        if (!panel || !list) {
            return;
        }

        var keyword = panel.querySelector("[data-filter-keyword]");
        var year = panel.querySelector("[data-filter-year]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var reset = panel.querySelector("[data-filter-reset]");
        var result = document.querySelector("[data-filter-result]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function applyUrlQuery() {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query && keyword) {
                keyword.value = query;
            }
        }

        function update() {
            var q = normalize(keyword && keyword.value);
            var selectedYear = normalize(year && year.value);
            var selectedRegion = normalize(region && region.value);
            var selectedType = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" "));

                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;

                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }

                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }

                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }

                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (result) {
                result.textContent = "当前显示 " + visible + " 部，共 " + cards.length + " 部。";
            }
        }

        [keyword, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                if (keyword) {
                    keyword.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (region) {
                    region.value = "";
                }
                if (type) {
                    type.value = "";
                }
                update();
            });
        }

        applyUrlQuery();
        update();
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initImageFallbacks();
        initFilters();
    });
})();
