(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initYearFilters() {
    var sections = document.querySelectorAll("[data-year-section]");
    sections.forEach(function (section) {
      var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-year-filter]"));
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-year-card]"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var year = button.getAttribute("data-year-filter");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var match = year === "all" || card.getAttribute("data-year") === year;
            card.style.display = match ? "" : "none";
          });
        });
      });
    });
  }

  function initLocalFilter() {
    document.querySelectorAll("[data-local-filter]").forEach(function (root) {
      var queryInput = root.querySelector("[data-local-query]");
      var yearSelect = root.querySelector("[data-local-year]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-local-card]"));
      var empty = root.querySelector("[data-local-empty]");

      function apply() {
        var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "all";
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-title") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var match = (!query || text.indexOf(query) !== -1) && (year === "all" || cardYear === year);
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (queryInput) {
        queryInput.addEventListener("input", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root) {
      return;
    }
    var queryInput = root.querySelector("[data-search-query]");
    var yearSelect = root.querySelector("[data-search-year]");
    var categorySelect = root.querySelector("[data-search-category]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-search-card]"));
    var empty = root.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (queryInput && initial) {
      queryInput.value = initial;
    }

    function apply() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "all";
      var category = categorySelect ? categorySelect.value : "all";
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute("data-title") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardCategory = card.getAttribute("data-category") || "";
        var match = (!query || text.indexOf(query) !== -1) && (year === "all" || cardYear === year) && (category === "all" || cardCategory === category);
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [queryInput, yearSelect, categorySelect].forEach(function (item) {
      if (!item) {
        return;
      }
      item.addEventListener(item.tagName === "SELECT" ? "change" : "input", apply);
    });
    apply();
  }

  ready(function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initYearFilters();
    initLocalFilter();
    initSearchPage();
  });
})();
