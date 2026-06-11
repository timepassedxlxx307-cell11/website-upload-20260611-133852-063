(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initPlayer(root) {
    var video = root.querySelector("video");
    var button = root.querySelector(".player-start");
    var errorBox = root.querySelector("[data-player-error]");
    var source = root.getAttribute("data-src");
    var loaded = false;
    var hls = null;

    function showError() {
      if (errorBox) {
        errorBox.textContent = "播放暂时不可用";
        errorBox.classList.add("is-visible");
      }
    }

    function bindSource() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showError();
              hls.destroy();
            }
          }
        });
      } else {
        video.src = source;
      }
      video.controls = true;
    }

    function start() {
      bindSource();
      root.classList.add("is-playing");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          root.classList.remove("is-playing");
        }
      });
      video.addEventListener("error", showError);
    }

    document.querySelectorAll("[data-side-play]").forEach(function (item) {
      item.addEventListener("click", function (event) {
        event.preventDefault();
        root.scrollIntoView({ behavior: "smooth", block: "center" });
        start();
      });
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
  });
})();
