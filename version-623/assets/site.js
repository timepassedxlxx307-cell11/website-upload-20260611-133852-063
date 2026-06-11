(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }
  }

  var panel = document.querySelector('[data-filter-panel]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (panel && cards.length) {
    var input = panel.querySelector('[data-filter-input]');
    var select = panel.querySelector('[data-year-filter]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var apply = function () {
      var keyword = normalize(input ? input.value : '');
      var year = select ? select.value : '';

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }

    apply();
  }
})();
