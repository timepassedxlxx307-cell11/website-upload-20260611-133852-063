(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupImages() {
    document.querySelectorAll('img.cover-img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
        img.removeAttribute('src');
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    show(0);
    restart();
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var raw = card.getAttribute(key) || '';
      raw.split(/[，,\/、]+/).forEach(function (part) {
        var value = part.trim();
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
    });
    return values.sort(function (a, b) {
      return a.localeCompare(b, 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var container = scope.parentElement;
      if (!container) {
        return;
      }
      var list = container.querySelector('[data-card-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);
      var input = scope.querySelector('[data-search-input]');
      var region = scope.querySelector('[data-region-filter]');
      var type = scope.querySelector('[data-type-filter]');
      var sort = scope.querySelector('[data-sort-select]');
      fillSelect(region, uniqueValues(cards, 'data-region'));
      fillSelect(type, uniqueValues(cards, 'data-type'));

      function matches(card) {
        var q = normalize(input && input.value);
        var regionValue = region && region.value;
        var typeValue = type && type.value;
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type')
        ].join(' '));
        if (q && haystack.indexOf(q) === -1) {
          return false;
        }
        if (regionValue && (card.getAttribute('data-region') || '').indexOf(regionValue) === -1) {
          return false;
        }
        if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
          return false;
        }
        return true;
      }

      function sortCards() {
        var mode = sort ? sort.value : 'year-desc';
        cards.sort(function (a, b) {
          var ay = parseInt(a.getAttribute('data-year') || '0', 10);
          var by = parseInt(b.getAttribute('data-year') || '0', 10);
          var as = parseInt(a.getAttribute('data-score') || '0', 10);
          var bs = parseInt(b.getAttribute('data-score') || '0', 10);
          var at = a.getAttribute('data-title') || '';
          var bt = b.getAttribute('data-title') || '';
          if (mode === 'year-asc') {
            return ay - by || at.localeCompare(bt, 'zh-CN');
          }
          if (mode === 'title-asc') {
            return at.localeCompare(bt, 'zh-CN');
          }
          if (mode === 'score-desc') {
            return bs - as || by - ay;
          }
          return by - ay || bs - as;
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      }

      function apply() {
        sortCards();
        cards.forEach(function (card) {
          card.classList.toggle('is-filter-hidden', !matches(card));
        });
      }

      [input, region, type, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-overlay');
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var started = false;

      function begin() {
        if (!stream) {
          return;
        }
        box.classList.add('is-playing');
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hlsPlayer = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hlsPlayer.loadSource(stream);
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      }

      button.addEventListener('click', begin);
      box.addEventListener('click', function (event) {
        if (event.target === box) {
          begin();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupFilters();
    setupPlayer();
  });
}());
