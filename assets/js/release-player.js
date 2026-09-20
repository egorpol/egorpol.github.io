(function () {
    'use strict';

    var root = document.querySelector('[data-release-player]');
    if (!root) return;

    var page = document.documentElement;
    var audio = root.querySelector('.release-audio');
    var play = root.querySelector('.release-play');
    var waveform = root.querySelector('.release-waveform');
    var waveEngine = root.querySelector('.release-wave-engine');
    var waveShape = root.querySelector('.release-wave-shape');
    var wavePlayed = root.querySelector('.release-wave-played');
    var nowTitle = root.querySelector('.release-now-title');
    var status = root.querySelector('.release-status');
    var time = root.querySelector('.release-time');
    var tracks = Array.from(root.querySelectorAll('[data-track]'));
    var currentIndex = 0;
    var loadSequence = 0;
    var isLoading = false;
    var requestedPlayback = false;
    var pendingPlay = null;
    var playbackError = null;
    var retryTime = null;
    var trackDownload = null;
    var debugPlayback = new URLSearchParams(window.location.search).has('playerDebug');

    function logPlayback(event, error) {
        var details = {
            event: event,
            track: currentTrack().dataset.title,
            requested: requestedPlayback,
            paused: audio.paused,
            time: audio.currentTime,
            readyState: audio.readyState,
            networkState: audio.networkState,
            error: error ? { name: error.name, message: error.message, code: error.code } : null
        };
        if (error) console.warn('[release-player]', JSON.stringify(details));
        else if (debugPlayback) console.debug('[release-player]', JSON.stringify(details));
    }

    var wavesurfer = window.WaveSurfer.create({
        container: waveEngine,
        media: audio,
        backend: 'MediaElement',
        height: 'auto',
        fillParent: true,
        hideScrollbar: true,
        autoScroll: false,
        autoCenter: false,
        interact: true,
        dragToSeek: true,
        waveColor: 'transparent',
        progressColor: 'transparent',
        cursorColor: 'transparent',
        cursorWidth: 0
    });

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) seconds = 0;
        var whole = Math.max(0, Math.floor(seconds));
        return String(Math.floor(whole / 60)).padStart(2, '0') + ':' + String(whole % 60).padStart(2, '0');
    }

    function currentTrack() {
        return tracks[currentIndex];
    }

    function duration() {
        var playerDuration = wavesurfer.getDuration();
        return Number.isFinite(playerDuration) && playerDuration > 0
            ? playerDuration
            : Number(currentTrack().dataset.duration);
    }

    function renderProgress(currentSeconds) {
        var total = duration();
        var current = Number.isFinite(currentSeconds) ? currentSeconds : wavesurfer.getCurrentTime();
        var progress = total ? Math.min(100, current / total * 100) : 0;
        root.style.setProperty('--release-progress', progress + '%');
        time.textContent = formatTime(current) + ' / ' + formatTime(total);
        waveform.setAttribute('aria-valuemax', String(Math.round(total)));
        waveform.setAttribute('aria-valuenow', String(Math.round(current)));
        waveform.setAttribute('aria-valuetext', formatTime(current) + ' of ' + formatTime(total));
    }

    function renderPlaying() {
        var playing = wavesurfer.isPlaying();
        /* The toggle represents the listener's intent, not a transient media
           pause while the browser seeks. Keeping those states separate also
           prevents the next click from cancelling a still-pending play request. */
        root.classList.toggle('is-playing', requestedPlayback);
        play.setAttribute('aria-pressed', String(requestedPlayback));
        play.setAttribute('aria-label', (requestedPlayback ? 'Pause ' : 'Play ') + currentTrack().dataset.title);
        play.querySelector('span').textContent = requestedPlayback ? 'Ⅱ' : '▶';
        status.textContent = isLoading
            ? 'LOADING'
            : (playbackError || (requestedPlayback
                ? (playing && !audio.seeking && audio.readyState >= 3 ? 'PLAYING' : 'BUFFERING')
                : 'READY'));
    }

    function setWaveformImage(url) {
        var value = 'url("' + url.replace(/"/g, '\\"') + '")';
        waveShape.style.setProperty('--release-waveform', value);
        wavePlayed.style.setProperty('--release-waveform', value);
    }

    function showPlaybackError(error) {
        logPlayback('error', error);
        pendingPlay = null;
        requestedPlayback = false;
        playbackError = error && error.name === 'NotAllowedError' ? 'PRESS PLAY' : 'LOAD ERROR';
        audio.pause();
        renderPlaying();
    }

    function applyPlaybackRequest(abortRetries) {
        renderPlaying();
        if (!requestedPlayback) {
            /* Pause must interrupt a pending play(), including while buffering.
               Its eventual rejection belongs to the cancelled request. */
            pendingPlay = null;
            audio.pause();
            return;
        }
        if (isLoading || pendingPlay || wavesurfer.isPlaying()) return;

        var request = { sequence: loadSequence };
        pendingPlay = request;

        function isCurrentRequest() {
            return pendingPlay === request && request.sequence === loadSequence;
        }

        function failed(error) {
            if (!isCurrentRequest()) return;
            pendingPlay = null;
            /* A cancelled play is not a broken file. Retry an interrupted seek
               once; never let a cancellation create an endless restart loop. */
            if (error && error.name === 'AbortError' && !audio.error) {
                logPlayback('play cancelled');
                if (requestedPlayback && !abortRetries) applyPlaybackRequest(1);
                else {
                    requestedPlayback = false;
                    audio.pause();
                    renderPlaying();
                }
                return;
            }
            showPlaybackError(error);
        }

        try {
            if (audio.ended) wavesurfer.setTime(0);
            /* Use the same media element as WaveSurfer, but retain its native
               play promise so cancellation and real media failures stay distinct. */
            Promise.resolve(audio.play()).then(function () {
                if (!isCurrentRequest()) return;
                pendingPlay = null;
                renderPlaying();
            }, failed);
        } catch (error) {
            failed(error);
        }
    }

    function loadTrack(index, autoplay, resumeAt) {
        var sequence = ++loadSequence;
        if (trackDownload) trackDownload.abort();
        trackDownload = new AbortController();
        pendingPlay = null;
        playbackError = null;
        retryTime = Number.isFinite(resumeAt) ? resumeAt : null;
        currentIndex = (index + tracks.length) % tracks.length;
        var track = currentTrack();
        var trackDuration = Number(track.dataset.duration);
        requestedPlayback = Boolean(autoplay);

        tracks.forEach(function (candidate, candidateIndex) {
            candidate.setAttribute('aria-current', candidateIndex === currentIndex ? 'true' : 'false');
        });

        isLoading = true;
        wavesurfer.pause();
        nowTitle.textContent = String(currentIndex + 1).padStart(2, '0') + ' · ' + track.dataset.title;
        waveform.setAttribute('aria-label', 'Seek through ' + track.dataset.title);
        setWaveformImage(track.dataset.waveform);
        root.style.setProperty('--release-progress', '0%');
        renderPlaying();
        renderProgress(0);

        /* Load the selected MP3 completely so seeking uses a local Blob URL,
           avoiding interrupted HTTP range reads in the embedded browser.
           WaveSurfer owns and revokes that URL. Supplied peaks keep it from
           decoding another full PCM copy just to render our existing image. */
        fetch(track.dataset.src, { signal: trackDownload.signal }).then(function (response) {
            logPlayback('download response ' + response.status);
            if (!response.ok) throw new Error('Audio request failed: HTTP ' + response.status);
            return response.blob();
        }).then(function (blob) {
            if (sequence !== loadSequence) return;
            return wavesurfer.loadBlob(blob, [[0, 0]], trackDuration);
        }).then(function () {
            if (sequence !== loadSequence) return;
            isLoading = false;
            renderProgress();
            renderPlaying();
            applyPlaybackRequest();
        }).catch(function (error) {
            if (sequence !== loadSequence) return;
            isLoading = false;
            showPlaybackError(error);
        });
    }

    play.addEventListener('click', function () {
        if (playbackError === 'LOAD ERROR' || audio.error) {
            loadTrack(currentIndex, true, wavesurfer.getCurrentTime());
            return;
        }
        playbackError = null;
        requestedPlayback = !requestedPlayback;
        applyPlaybackRequest();
    });
    tracks.forEach(function (track, index) {
        track.addEventListener('click', function () { loadTrack(index, true); });
    });
    waveform.addEventListener('keydown', function (event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        var current = wavesurfer.getCurrentTime();
        if (event.key === 'Home') wavesurfer.setTime(0);
        else if (event.key === 'End') wavesurfer.setTime(duration());
        else wavesurfer.setTime(Math.max(0, Math.min(duration(), current + (event.key === 'ArrowRight' ? 5 : -5))));
        renderProgress();
    });

    wavesurfer.on('timeupdate', renderProgress);
    wavesurfer.on('interaction', renderProgress);
    wavesurfer.on('seeking', renderProgress);
    wavesurfer.on('play', renderPlaying);
    wavesurfer.on('pause', function () {
        /* Honour pauses from browser/OS controls too. Seeking is reconciled only
           once it finishes, rather than restarting from every pause event. */
        if (audio.paused && !isLoading && !pendingPlay && !audio.seeking && !audio.ended) requestedPlayback = false;
        renderPlaying();
    });
    wavesurfer.on('finish', function () { loadTrack(currentIndex + 1, true); });
    audio.addEventListener('error', function () {
        if (!audio.error) return;
        isLoading = false;
        showPlaybackError(audio.error);
    });

    if (debugPlayback) {
        ['play', 'playing', 'pause', 'seeking', 'seeked', 'waiting', 'canplay', 'emptied', 'loadedmetadata', 'error'].forEach(function (event) {
            audio.addEventListener(event, function () { logPlayback(event, audio.error); });
        });
    }

    audio.addEventListener('loadedmetadata', function () {
        if (retryTime !== null) {
            var position = retryTime;
            retryTime = null;
            wavesurfer.setTime(Math.min(position, duration()));
        }
    });
    audio.addEventListener('seeked', function () {
        renderProgress();
        if (requestedPlayback && !playbackError) applyPlaybackRequest();
    });
    ['canplay', 'playing', 'waiting', 'seeking'].forEach(function (event) {
        audio.addEventListener(event, renderPlaying);
    });

    loadTrack(0, false);

    /* The cover uses the same scratch/reseal grammar as the homepage portrait:
       a deliberately tiny bitmap is enlarged without smoothing, pointer movement
       opens holes, idle time reseals them, and brief snow bars interrupt the mask. */
    var cover = root.querySelector('[data-release-cover]');
    var coverEffect = null;

    function startCoverEffect() {
        stopCoverEffect();
        if (!cover || page.dataset.chrome !== 'on') return;

        var SIZE = 128;
        var BRUSH = 14;
        var canvas = document.createElement('canvas');
        canvas.className = 'release-cover-pixel';
        canvas.width = SIZE;
        canvas.height = SIZE;
        canvas.setAttribute('aria-hidden', 'true');
        cover.appendChild(canvas);

        var mask = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var maskContext = mask.getContext('2d');
        var openPixels = new Uint8Array(SIZE * SIZE);
        var holes = [];
        var sheet = null;
        var lastX = -1;
        var lastY = -1;
        var snow = null;
        var snowWait = 0;
        var snowHold = 0;
        var idleWait = 0;
        var resealFrame = 0;
        var resealBorn = 0;
        var resealLast = 0;
        var resealCarry = 0;
        var dropped = false;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var requestedSheet = '';

        mask.width = SIZE;
        mask.height = SIZE;
        context.imageSmoothingEnabled = false;
        maskContext.imageSmoothingEnabled = false;

        function refreshSheet() {
            var src = page.dataset.theme === 'dark' && cover.dataset.pixelCoverDark
                ? cover.dataset.pixelCoverDark
                : cover.dataset.pixelCover;
            var image = new Image();
            requestedSheet = src;
            image.onload = function () {
                if (dropped || requestedSheet !== src) return;
                sheet = image;
                paint();
            };
            image.src = src;
        }

        var themeObserver = new MutationObserver(refreshSheet);

        function paint() {
            if (!sheet) return;
            context.clearRect(0, 0, SIZE, SIZE);
            context.globalCompositeOperation = 'source-over';
            context.drawImage(sheet, 0, 0, SIZE, SIZE);
            context.globalCompositeOperation = 'destination-out';
            context.drawImage(mask, 0, 0);
            if (snow) {
                context.globalCompositeOperation = 'source-atop';
                context.fillStyle = snow.fill;
                context.fillRect(snow.x, snow.y, snow.w, snow.h);
            }
            context.globalCompositeOperation = 'source-over';
        }

        function stamp(x, y) {
            var radius = BRUSH;
            var x0 = Math.max(0, Math.floor(x - radius));
            var x1 = Math.min(SIZE - 1, Math.ceil(x + radius));
            var y0 = Math.max(0, Math.floor(y - radius));
            var y1 = Math.min(SIZE - 1, Math.ceil(y + radius));
            var radiusSquared = radius * radius;
            maskContext.fillStyle = '#fff';
            for (var py = y0; py <= y1; py += 1) {
                for (var px = x0; px <= x1; px += 1) {
                    var dx = px + 0.5 - x;
                    var dy = py + 0.5 - y;
                    if ((dx * dx) + (dy * dy) <= radiusSquared) {
                        var index = (py * SIZE) + px;
                        if (!openPixels[index]) {
                            openPixels[index] = 1;
                            holes.push(index);
                            maskContext.fillRect(px, py, 1, 1);
                        }
                    }
                }
            }
        }

        function localPoint(event) {
            var bounds = canvas.getBoundingClientRect();
            if (bounds.width === 0 || bounds.height === 0) return null;
            return {
                x: (event.clientX - bounds.left) / bounds.width * SIZE,
                y: (event.clientY - bounds.top) / bounds.height * SIZE
            };
        }

        function stopReseal() {
            if (resealFrame) {
                window.cancelAnimationFrame(resealFrame);
                resealFrame = 0;
            }
        }

        function armIdle() {
            window.clearTimeout(idleWait);
            if (reduceMotion || !holes.length) return;
            idleWait = window.setTimeout(startReseal, 5000 + (Math.random() * 5000));
        }

        function hushSnow() {
            snow = null;
            window.clearTimeout(snowWait);
            window.clearTimeout(snowHold);
        }

        function startReseal() {
            stopReseal();
            hushSnow();
            if (!holes.length) {
                scheduleSnow();
                return;
            }
            resealBorn = performance.now();
            resealLast = resealBorn;
            resealCarry = 0;
            resealFrame = window.requestAnimationFrame(resealStep);
        }

        function resealStep(now) {
            if (dropped) return;

            var elapsed = (now - resealBorn) / 1000;
            var delta = Math.min(0.05, (now - resealLast) / 1000);
            resealLast = now;
            resealCarry += (7 * Math.exp(0.38 * elapsed)) * delta;
            var count = Math.floor(resealCarry);
            resealCarry -= count;

            if (count > 0) {
                if (!holes.length) {
                    resealFrame = 0;
                    scheduleSnow();
                    return;
                }

                while (count && holes.length) {
                    var pick = Math.floor(Math.random() * holes.length);
                    var index = holes[pick];
                    var last = holes.pop();
                    if (pick < holes.length) holes[pick] = last;
                    openPixels[index] = 0;
                    maskContext.clearRect(index % SIZE, Math.floor(index / SIZE), 1, 1);
                    count -= 1;
                }
                paint();
                if (!holes.length) {
                    resealFrame = 0;
                    scheduleSnow();
                    return;
                }
            }

            resealFrame = window.requestAnimationFrame(resealStep);
        }

        function scratchTo(event) {
            var point = localPoint(event);
            if (!point) return;
            if (resealFrame) {
                stopReseal();
                scheduleSnow();
            }
            if (lastX < 0) stamp(point.x, point.y);
            else {
                var dx = point.x - lastX;
                var dy = point.y - lastY;
                var steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 2));
                for (var index = 1; index <= steps; index += 1) {
                    stamp(lastX + dx * index / steps, lastY + dy * index / steps);
                }
            }
            lastX = point.x;
            lastY = point.y;
            paint();
            armIdle();
        }

        function onPointerMove(event) {
            scratchTo(event);
        }

        function onPointerLeave() {
            lastX = -1;
            lastY = -1;
            armIdle();
        }

        function snowBar() {
            var roll = Math.random();
            var height;
            if (roll < 0.4) height = 6 + Math.floor(Math.random() * 18);
            else if (roll < 0.8) height = 24 + Math.floor(Math.random() * 28);
            else height = 52 + Math.floor(Math.random() * 24);
            return {
                x: Math.floor(Math.random() * SIZE),
                y: Math.floor(Math.random() * Math.max(1, SIZE - height)),
                w: Math.random() < 0.2 ? 2 : 1,
                h: height,
                fill: Math.random() < 0.5
                    ? 'rgba(255,255,255,0.46)'
                    : 'rgba(0,0,0,0.62)'
            };
        }

        function clearSnow() {
            snow = null;
            paint();
            scheduleSnow();
        }

        function flashSnow() {
            if (dropped || reduceMotion) return;
            snowWait = window.setTimeout(function () {
                if (dropped) return;
                if (Math.random() < 0.12) {
                    scheduleSnow();
                    return;
                }
                snow = snowBar();
                paint();
                snowHold = window.setTimeout(clearSnow, 45 + Math.floor(Math.random() * 80));
            }, 1600 + (Math.random() * 3800));
        }

        function scheduleSnow() {
            if (reduceMotion) return;
            flashSnow();
        }

        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerleave', onPointerLeave);
        canvas.addEventListener('pointercancel', onPointerLeave);
        themeObserver.observe(page, { attributes: true, attributeFilter: ['data-theme'] });

        scheduleSnow();

        coverEffect = {
            canvas: canvas,
            drop: function () {
                dropped = true;
                canvas.removeEventListener('pointermove', onPointerMove);
                canvas.removeEventListener('pointerleave', onPointerLeave);
                canvas.removeEventListener('pointercancel', onPointerLeave);
                themeObserver.disconnect();
                window.clearTimeout(snowWait);
                window.clearTimeout(snowHold);
                window.clearTimeout(idleWait);
                stopReseal();
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        };

        refreshSheet();
    }

    function stopCoverEffect() {
        if (!coverEffect) return;
        coverEffect.drop();
        coverEffect = null;
    }

    new MutationObserver(function (mutations) {
        if (mutations.some(function (mutation) { return mutation.attributeName === 'data-chrome'; })) {
            if (page.dataset.chrome === 'on') startCoverEffect();
            else stopCoverEffect();
        }
    }).observe(page, { attributes: true, attributeFilter: ['data-chrome'] });

    if (page.dataset.chrome === 'on') startCoverEffect();
}());
