(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var navSearch = document.querySelector('.nav-search');

  if (navToggle && nav && navSearch) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      navSearch.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeSlide);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
  var searchPanel = document.querySelector('[data-search-panel]');
  var searchResults = document.querySelector('[data-search-results]');
  var closeSearch = document.querySelector('[data-search-close]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function resolveUrl(url) {
    var inMovieFolder = location.pathname.indexOf('/movie/') !== -1;
    if (inMovieFolder && url.indexOf('../') !== 0) {
      return '../' + url;
    }
    return url;
  }

  function resolveCover(cover) {
    var inMovieFolder = location.pathname.indexOf('/movie/') !== -1;
    if (inMovieFolder && cover.indexOf('../') !== 0) {
      return '../' + cover.replace(/^\.\//, '');
    }
    return cover;
  }

  function renderSearch(query) {
    if (!searchPanel || !searchResults) {
      return;
    }

    var keyword = normalize(query);
    if (!keyword) {
      searchPanel.classList.remove('is-open');
      searchResults.innerHTML = '';
      return;
    }

    var source = window.movieSearchIndex || [];
    var matches = source.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.tags,
        item.category
      ].join(' '));
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 40);

    searchResults.innerHTML = matches.map(function (item) {
      return '<a href="' + resolveUrl(item.url) + '">' +
        '<img src="' + resolveCover(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
        '</a>';
    }).join('');

    searchPanel.classList.add('is-open');
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input.value);
    });
  });

  if (closeSearch && searchPanel) {
    closeSearch.addEventListener('click', function () {
      searchPanel.classList.remove('is-open');
      searchInputs.forEach(function (input) {
        input.value = '';
      });
    });
  }

  var localFilter = document.querySelector('[data-local-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (localFilter && cards.length) {
    localFilter.addEventListener('input', function () {
      var keyword = normalize(localFilter.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-card-title'));
        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  }
})();
