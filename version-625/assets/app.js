(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    restart();
                });
            });

            show(0);
            restart();
        }

        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function applyFilters() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var type = typeSelect ? typeSelect.value : "";
                var region = regionSelect ? regionSelect.value : "";

                cards.forEach(function (card) {
                    var title = (card.getAttribute("data-title") || "").toLowerCase();
                    var meta = (card.getAttribute("data-meta") || "").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var matched = true;

                    if (query && title.indexOf(query) === -1 && meta.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (region && cardRegion !== region) {
                        matched = false;
                    }

                    card.classList.toggle("hidden-card", !matched);
                });
            }

            [input, typeSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
        });

        Array.prototype.slice.call(document.querySelectorAll("[data-back-top]")).forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    });

    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-player='movie']");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !source) {
            return;
        }

        var attached = false;
        var requested = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (requested) {
                        video.play().catch(function () {});
                    }
                });
            } else {
                video.src = source;
            }
            attached = true;
        }

        function start() {
            requested = true;
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
})();
