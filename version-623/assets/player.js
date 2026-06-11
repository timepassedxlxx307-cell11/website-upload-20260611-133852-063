(function () {
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-play-url]'));

  panels.forEach(function (panel) {
    var video = panel.querySelector('video');
    var button = panel.querySelector('.player-start');
    var url = panel.getAttribute('data-play-url');
    var prepared = false;
    var hls = null;

    var prepare = function () {
      if (prepared || !video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      prepared = true;
    };

    var start = function () {
      prepare();
      panel.classList.add('is-playing');
      video.controls = true;
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        panel.classList.add('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
