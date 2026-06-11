function setupMoviePlayer(source) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var button = document.querySelector('[data-player-button]');
  var loaded = false;
  var hls = null;

  if (!video || !overlay || !button || !source) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function startPlayback() {
    attachSource();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  overlay.addEventListener('click', startPlayback);
  button.addEventListener('click', startPlayback);

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
