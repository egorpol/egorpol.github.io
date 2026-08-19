(function () {
    'use strict';

    var el = document.documentElement;

    /* --- Portrait scratch-off ------------------------------------------ */
    /* The ZX overlay sits on a canvas so we can punch holes under the cursor
       instead of lifting the whole SCREEN$. After a short idle the holes fill
       back in, pixel by pixel. A column of snow is dropped on the remaining
       pixels now and then, light or dark, rarely enough that it reads as a
       doubt. */

    var ZX_W = 128;
    var ZX_H = 192;
    var BRUSH = 14;
    var portrait = null;

    function zxUrl() {
        return el.dataset.theme === 'dark'
            ? '/assets/images/avatar-zx-dark.png'
            : '/assets/images/avatar-zx.png';
    }

    function loadSheet(src, done) {
        var img = new Image();
        img.onload = function () { done(img); };
        img.src = src;
    }

    function startPortrait() {
        stopPortrait();

        var frame = document.querySelector('.hero-portrait');
        if (!frame) return;

        var canvas = document.createElement('canvas');
        canvas.className = 'hero-zx';
        canvas.width = ZX_W;
        canvas.height = ZX_H;
        canvas.setAttribute('aria-hidden', 'true');
        frame.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        function snapOverlay() {
            var w = frame.clientWidth;
            var h = frame.clientHeight;
            if (!w || !h) return;
            var scale = Math.max(1, Math.round(Math.min(w / ZX_W, h / ZX_H)));
            canvas.style.width = (ZX_W * scale) + 'px';
            canvas.style.height = (ZX_H * scale) + 'px';
            canvas.style.left = Math.round((w - (ZX_W * scale)) / 2) + 'px';
            canvas.style.top = Math.round((h - (ZX_H * scale)) / 2) + 'px';
        }

        snapOverlay();
        var overlayFit = new ResizeObserver(snapOverlay);
        overlayFit.observe(frame);

        var mask = document.createElement('canvas');
        mask.width = ZX_W;
        mask.height = ZX_H;
        var mctx = mask.getContext('2d');
        mctx.imageSmoothingEnabled = false;

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
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var observer = new MutationObserver(function () {
            loadSheet(zxUrl(), function (img) {
                if (!portrait) return;
                sheet = img;
                paint();
            });
        });

        function paint() {
            if (!sheet) return;
            ctx.clearRect(0, 0, ZX_W, ZX_H);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(sheet, 0, 0, ZX_W, ZX_H);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(mask, 0, 0);
            if (snow) {
                // Only the remaining SCREEN$, never the holes already wiped.
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = snow.fill;
                ctx.fillRect(snow.x, snow.y, snow.w, snow.h);
            }
            ctx.globalCompositeOperation = 'source-over';
        }

        function stamp(x, y) {
            var r = BRUSH;
            var x0 = Math.max(0, Math.floor(x - r));
            var x1 = Math.min(ZX_W - 1, Math.ceil(x + r));
            var y0 = Math.max(0, Math.floor(y - r));
            var y1 = Math.min(ZX_H - 1, Math.ceil(y + r));
            var rr = r * r;
            mctx.fillStyle = '#fff';
            for (var py = y0; py <= y1; py += 1) {
                for (var px = x0; px <= x1; px += 1) {
                    var dx = px + 0.5 - x;
                    var dy = py + 0.5 - y;
                    if ((dx * dx) + (dy * dy) <= rr) mctx.fillRect(px, py, 1, 1);
                }
            }
        }

        function localXY(event) {
            var rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return null;
            return {
                x: ((event.clientX - rect.left) / rect.width) * ZX_W,
                y: ((event.clientY - rect.top) / rect.height) * ZX_H
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
            resealBorn = performance.now();
            resealLast = resealBorn;
            resealCarry = 0;
            resealFrame = window.requestAnimationFrame(resealStep);
        }

        function resealStep(now) {
            if (!portrait) return;

            var elapsed = (now - resealBorn) / 1000;
            var dt = Math.min(0.05, (now - resealLast) / 1000);
            resealLast = now;
            // Continuous exponential: crawls, then gathers speed without steps.
            resealCarry += (7 * Math.exp(0.38 * elapsed)) * dt;
            var count = Math.floor(resealCarry);
            resealCarry -= count;

            if (count > 0) {
                var data = mctx.getImageData(0, 0, ZX_W, ZX_H);
                var d = data.data;
                var holes = [];
                for (var i = 3; i < d.length; i += 4) {
                    if (d[i]) holes.push(i - 3);
                }
                if (!holes.length) {
                    resealFrame = 0;
                    scheduleSnow();
                    return;
                }

                while (count && holes.length) {
                    var pick = Math.floor(Math.random() * holes.length);
                    var offset = holes[pick];
                    holes.splice(pick, 1);
                    d[offset] = 0;
                    d[offset + 1] = 0;
                    d[offset + 2] = 0;
                    d[offset + 3] = 0;
                    count -= 1;
                }
                mctx.putImageData(data, 0, 0);
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
            var p = localXY(event);
            if (!p) return;
            if (resealFrame) {
                stopReseal();
                scheduleSnow();
            }
            if (lastX < 0) {
                stamp(p.x, p.y);
            } else {
                var dx = p.x - lastX;
                var dy = p.y - lastY;
                var steps = Math.max(1, Math.ceil(Math.sqrt((dx * dx) + (dy * dy)) / 2));
                for (var i = 1; i <= steps; i += 1) {
                    stamp(lastX + ((dx * i) / steps), lastY + ((dy * i) / steps));
                }
            }
            lastX = p.x;
            lastY = p.y;
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
            var h;
            if (roll < 0.4) h = 6 + Math.floor(Math.random() * 18);
            else if (roll < 0.8) h = 24 + Math.floor(Math.random() * 28);
            else h = 52 + Math.floor(Math.random() * 24);
            return {
                x: Math.floor(Math.random() * ZX_W),
                y: Math.floor(Math.random() * Math.max(1, ZX_H - h)),
                w: Math.random() < 0.2 ? 2 : 1,
                h: h,
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
            if (!portrait || reduceMotion) return;
            snowWait = window.setTimeout(function () {
                if (!portrait) return;
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
        observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] });

        portrait = {
            canvas: canvas,
            observer: observer,
            drop: function () {
                canvas.removeEventListener('pointermove', onPointerMove);
                canvas.removeEventListener('pointerleave', onPointerLeave);
                canvas.removeEventListener('pointercancel', onPointerLeave);
                observer.disconnect();
                overlayFit.disconnect();
                window.clearTimeout(snowWait);
                window.clearTimeout(snowHold);
                window.clearTimeout(idleWait);
                stopReseal();
                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
            }
        };

        loadSheet(zxUrl(), function (img) {
            if (!portrait) return;
            sheet = img;
            paint();
        });

        scheduleSnow();
    }

    function stopPortrait() {
        if (!portrait) return;
        portrait.drop();
        portrait = null;
    }

    /* --- Studio chrome switch ------------------------------------------ */

    var toggle = document.getElementById('chrome-toggle');

    function applyChrome(state, persist) {
        el.dataset.chrome = state;

        if (persist) {
            try {
                localStorage.setItem('chrome', state);
            } catch (_error) {
                // Persistence is optional when storage is unavailable.
            }
        }

        if (toggle) {
            var on = state === 'on';
            toggle.setAttribute('aria-pressed', String(on));
            toggle.setAttribute('aria-label', on ? 'Turn studio chrome off' : 'Turn studio chrome on');
        }

        if (state === 'on') startPortrait();
        else stopPortrait();
    }

    // theme-init.js has already set the attribute; this only syncs the button.
    applyChrome(el.dataset.chrome === 'off' ? 'off' : 'on');

    /* --- First-visit hint ---------------------------------------------- */

    var hint = document.getElementById('chrome-hint');
    var hintClose = document.getElementById('chrome-hint-close');
    var HINT_KEY = 'chrome-hint-2';

    function hintSeen() {
        try {
            return localStorage.getItem(HINT_KEY) === '1';
        } catch (_error) {
            // Without storage the hint would return on every page, so skip it.
            return true;
        }
    }

    function dismissHint() {
        if (!hint || hint.hidden) return;
        hint.hidden = true;
        try {
            localStorage.setItem(HINT_KEY, '1');
        } catch (_error) {
            // Nothing to do; the hint simply may reappear.
        }
    }

    // Only worth showing while the chrome is on, since it explains how to
    // turn it off.
    if (hint && !hintSeen() && el.dataset.chrome !== 'off') {
        setTimeout(function () {
            if (!hintSeen()) hint.hidden = false;
        }, 1400);
        setTimeout(dismissHint, 15000);
    }

    if (hintClose) hintClose.addEventListener('click', dismissHint);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') dismissHint();
    });

    if (toggle) {
        toggle.addEventListener('click', function () {
            dismissHint();
            applyChrome(el.dataset.chrome === 'on' ? 'off' : 'on', true);
        });
    }

    /* --- Tape transport ------------------------------------------------- */

    var ticking = false;
    var idle;

    function update() {
        var max = el.scrollHeight - el.clientHeight;
        el.style.setProperty('--scroll-progress', max > 0 ? el.scrollTop / max : 0);
        ticking = false;
    }

    function onScroll() {
        // Run the transport while scrolling, and let it coast briefly after the
        // last event so short flicks do not make the stripes stutter.
        el.setAttribute('data-loading', 'true');
        clearTimeout(idle);
        idle = setTimeout(function () {
            el.removeAttribute('data-loading');
        }, 220);

        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
})();
