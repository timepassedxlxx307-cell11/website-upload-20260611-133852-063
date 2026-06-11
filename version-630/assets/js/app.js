(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function searchText(movie) {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      (movie.tags || []).join(" "),
      movie.oneLine
    ].join(" ").toLowerCase();
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\" data-movie-card>" +
        "<a class=\"movie-poster\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
          "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"play-chip\">播放</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
          "<div class=\"movie-card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.year) + "</div>" +
          "<h3><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p>" + escapeHtml(movie.oneLine) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  function bindMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    });
  }

  function bindSearchForms() {
    selectAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", root);
    var dots = selectAll("[data-hero-dot]", root);
    var previous = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5500);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function bindLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var cards = selectAll("[data-movie-card]");
    var empty = document.querySelector("[data-empty-state]");

    if (!input || cards.length === 0) {
      return;
    }

    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
        var match = !value || haystack.indexOf(value) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }

  function renderSearchPage() {
    var results = document.getElementById("search-results");
    var summary = document.querySelector("[data-search-summary]");
    var empty = document.querySelector("[data-search-empty]");
    var pageInput = document.querySelector("[data-search-page-input]");

    if (!results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (pageInput) {
      pageInput.value = query;
    }

    if (!query) {
      results.innerHTML = "";
      if (summary) {
        summary.textContent = "输入关键词后显示结果";
      }
      if (empty) {
        empty.classList.remove("is-visible");
      }
      return;
    }

    var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = searchText(movie);
      return keywords.every(function (keyword) {
        return haystack.indexOf(keyword) !== -1;
      });
    });

    results.innerHTML = matches.map(cardTemplate).join("");

    if (summary) {
      summary.textContent = matches.length ? "与“" + query + "”相关的影视内容" : "未找到“" + query + "”相关内容";
    }

    if (empty) {
      empty.classList.toggle("is-visible", matches.length === 0);
    }
  }

  window.initMoviePlayer = function (streamUrl) {
    var root = document.querySelector("[data-movie-player]");
    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var button = root.querySelector("[data-player-button]");
    var hlsInstance = null;
    var started = false;

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function showButton() {
      if (button) {
        button.classList.remove("is-hidden");
      }
    }

    function attachSource() {
      if (started || !video || !streamUrl) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attachSource();
      hideButton();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          showButton();
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });

    video.addEventListener("play", hideButton);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showButton();
      }
    });
    video.addEventListener("ended", showButton);

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindLocalFilter();
    renderSearchPage();
  });
})();
