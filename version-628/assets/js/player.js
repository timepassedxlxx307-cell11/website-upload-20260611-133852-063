(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setMessage(frame, message) {
        var target = frame.querySelector("[data-player-message]");

        if (target) {
            target.textContent = message || "";
        }
    }

    function attachHls(video, source, frame) {
        if (!source) {
            setMessage(frame, "当前影片暂未配置播放源。");
            return;
        }

        if (source.indexOf(".m3u8") !== -1 && window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {
                    setMessage(frame, "浏览器阻止了自动播放，请再次点击播放器。 ");
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage(frame, "播放源加载失败，请稍后重试。");
                }
            });
            frame._hls = hls;
            return;
        }

        if (source.indexOf(".m3u8") !== -1 && video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {
                setMessage(frame, "浏览器阻止了自动播放，请再次点击播放器。");
            });
            return;
        }

        video.src = source;
        video.play().catch(function () {
            setMessage(frame, "浏览器阻止了自动播放，请再次点击播放器。");
        });
    }

    function initPlayers() {
        var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame"));

        frames.forEach(function (frame) {
            var button = frame.querySelector(".play-overlay");
            var video = frame.querySelector("video");
            var source = frame.getAttribute("data-video-src");
            var loaded = false;

            if (!button || !video) {
                return;
            }

            button.addEventListener("click", function () {
                frame.classList.add("is-playing");

                if (!loaded) {
                    loaded = true;
                    attachHls(video, source, frame);
                    return;
                }

                video.play().catch(function () {
                    setMessage(frame, "请再次点击播放器开始播放。");
                });
            });
        });
    }

    ready(initPlayers);
})();
