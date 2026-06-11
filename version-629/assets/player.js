(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('[data-play-overlay]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var prepared = false;
    var hls = null;

    function attachSource() {
      if (!source) {
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 1200);
        });
      }
      video.src = source;
      return Promise.resolve();
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function startPlayback() {
      hideOverlay();
      if (!prepared) {
        prepared = true;
        attachSource().then(function () {
          var playRequest = video.play();
          if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {});
          }
        });
        return;
      }
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
