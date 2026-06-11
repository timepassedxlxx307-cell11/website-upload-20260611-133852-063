(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function clean(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      });
    });

    show(0);
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var keywordInput = document.querySelector('[data-live-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');

    function applyFilter() {
      var keyword = clean(keywordInput && keywordInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var haystack = clean([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchType));
      });
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  function renderCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '<img class="movie-poster" src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="card-type">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3 class="movie-card-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '<p class="movie-line">' + escapeHtml(movie.line) + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = clean(params.get('q'));
    var input = document.querySelector('[data-search-page-input]');
    if (input && keyword) {
      input.value = params.get('q');
    }
    if (!keyword) {
      results.innerHTML = '<p class="search-results-note">输入片名、题材、地区或标签，即可浏览匹配内容。</p>';
      return;
    }
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = clean([
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags,
        movie.line
      ].join(' '));
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (!matched.length) {
      results.innerHTML = '<p class="search-results-note">没有找到匹配内容，请尝试更换关键词。</p>';
      return;
    }
    results.innerHTML = matched.map(renderCard).join('');
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
