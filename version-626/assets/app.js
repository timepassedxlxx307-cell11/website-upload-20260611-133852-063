(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-back-top]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var input = form.querySelector('[data-filter-input]');
        var select = form.querySelector('[data-filter-select]');
        var scopeSelector = form.getAttribute('data-filter-form');
        var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]')) : [];
        var empty = document.querySelector(form.getAttribute('data-empty-target'));

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function update() {
            var keyword = normalize(input ? input.value : '');
            var selected = normalize(select ? select.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var blob = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var typeText = normalize(card.getAttribute('data-type'));
                var matchedKeyword = !keyword || blob.indexOf(keyword) !== -1;
                var matchedType = !selected || typeText.indexOf(selected) !== -1 || blob.indexOf(selected) !== -1;
                var show = matchedKeyword && matchedType;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', update);
        }
        if (select) {
            select.addEventListener('change', update);
        }
        update();
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('active', position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    window.SitePlayer = {
        bind: function (videoId, buttonId, overlayId, streamUrl) {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var overlay = document.getElementById(overlayId);
            var started = false;
            var hls = null;

            if (!video || !button || !overlay || !streamUrl) {
                return;
            }

            function attach() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                attach();
                overlay.classList.add('hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        overlay.classList.remove('hidden');
                    });
                }
            }

            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });

            overlay.addEventListener('click', function () {
                play();
            });

            video.addEventListener('click', function () {
                if (!started) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                overlay.classList.add('hidden');
            });

            video.addEventListener('ended', function () {
                overlay.classList.remove('hidden');
            });

            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        }
    };
})();
