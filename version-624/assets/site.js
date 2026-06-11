(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === current);
            });
        }

        function move(step) {
            setSlide(current + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        setSlide(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var grid = document.querySelector(".filter-grid");
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var searchInput = document.querySelector("[data-filter-search]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var categorySelect = document.querySelector("[data-filter-category]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function apply() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var category = normalize(categorySelect && categorySelect.value);

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var visible = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    visible = false;
                }

                if (year && cardYear !== year) {
                    visible = false;
                }

                if (type && cardType !== type) {
                    visible = false;
                }

                if (category && cardCategory !== category) {
                    visible = false;
                }

                card.classList.toggle("is-hidden", !visible);
            });
        }

        [searchInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function initPlayer() {
        var video = document.querySelector("#player-video");
        if (!video) {
            return;
        }

        var cover = document.querySelector(".player-cover");
        var stream = video.getAttribute("data-stream");
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !stream) {
                return Promise.resolve();
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);

                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }

            video.src = stream;
            return Promise.resolve();
        }

        function play() {
            if (cover) {
                cover.classList.add("is-hidden");
            }

            attach().then(function () {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            });
        }

        if (cover) {
            cover.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    initHero();
    initFilters();
    initPlayer();
})();
