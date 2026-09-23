/* Deterministic media races that are hard to reproduce with fully cached MP3s.
   Run with: node --test scripts/test-release-player.cjs */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../assets/js/release-player.js'), 'utf8');

function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

class Element {
    constructor() {
        this.listeners = {};
        this.attributes = {};
        this.dataset = {};
        this.style = { setProperty() {} };
        this.classList = { toggle() {} };
        this.textContent = '';
    }
    addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
    emit(type, value) { for (const fn of this.listeners[type] || []) fn(value); }
    setAttribute(name, value) { this.attributes[name] = value; }
    querySelector() { return this.child; }
}

async function flush() { for (let i = 0; i < 20; i++) await Promise.resolve(); }

async function player() {
    const selectors = ['.release-audio', '.release-play', '.release-waveform', '.release-wave-engine', '.release-wave-shape', '.release-wave-played', '.release-now-title', '.release-status', '.release-time'];
    const elements = Object.fromEntries(selectors.map(key => [key, new Element()]));
    const audio = elements['.release-audio'];
    const toggle = elements['.release-play'];
    toggle.child = new Element();
    const requests = [], loads = [], downloads = [], warnings = [];
    const tracks = [0, 1].map(index => {
        const el = new Element();
        el.dataset = { title: `Track ${index}`, src: `/track-${index}.mp3`, duration: '300', waveform: '/wave.png' };
        return el;
    });
    const root = new Element();
    root.querySelector = key => elements[key] || null;
    root.querySelectorAll = () => tracks;
    const ws = new Element();
    ws.on = ws.addEventListener;
    Object.assign(audio, { paused: true, ended: false, seeking: false, error: null, currentTime: 0, readyState: 4, networkState: 1 });
    audio.play = () => {
        const request = deferred();
        requests.push(request);
        audio.paused = false;
        ws.emit('play');
        return request.promise;
    };
    audio.pause = () => {
        if (audio.paused) return;
        audio.paused = true;
        queueMicrotask(() => ws.emit('pause'));
    };
    audio.load = () => { audio.reloads = (audio.reloads || 0) + 1; audio.error = null; audio.currentTime = 0; };
    ws.pause = audio.pause;
    ws.loadBlob = blob => {
        const load = deferred();
        loads.push(load);
        audio.src = blob.src;
        audio.error = null;
        audio.currentTime = 0;
        load.resolve();
        return load.promise;
    };
    ws.isPlaying = () => !audio.paused && !audio.ended;
    ws.getDuration = () => 300;
    ws.getCurrentTime = () => audio.currentTime;
    ws.setTime = seconds => { audio.currentTime = seconds; ws.emit('timeupdate', seconds); };
    runInNewContext(source, {
        document: { querySelector: () => root, documentElement: { dataset: { chrome: 'off' } } },
        window: { WaveSurfer: { create: () => ws }, location: { search: '' } },
        URLSearchParams,
        AbortController,
        fetch: async (src, options) => {
            downloads.push({ src, signal: options.signal });
            return { ok: true, blob: async () => ({ src }) };
        },
        MutationObserver: class { observe() {} },
        console: { warn: (...args) => warnings.push(args), debug() {} }
    });
    await flush();
    return { audio, toggle, ws, requests, loads, downloads, warnings, tracks,
        click: () => toggle.emit('click'),
        status: () => elements['.release-status'].textContent,
        pressed: () => toggle.attributes['aria-pressed'] };
}

test('pause immediately cancels a pending play, without waiting for its promise', async () => {
    const p = await player();
    p.click();
    p.click();
    assert.equal(p.audio.paused, true);
    assert.equal(p.pressed(), 'false');
    p.requests[0].reject(Object.assign(new Error('interrupted by pause'), { name: 'AbortError' }));
    await flush();
    assert.equal(p.status(), 'READY');
    assert.equal(p.warnings.length, 0);
});

test('a stale failure after play/pause/play cannot turn off the new request', async () => {
    const p = await player();
    p.click(); p.click(); p.click();
    p.requests[0].reject(new Error('old playback failed'));
    p.requests[1].resolve();
    await flush();
    assert.equal(p.pressed(), 'true');
    assert.equal(p.audio.paused, false);
    assert.equal(p.status(), 'PLAYING');
    assert.equal(p.warnings.length, 0);
});

test('a previous track cannot fail the currently selected track', async () => {
    const p = await player();
    p.click();
    p.tracks[1].emit('click');
    await flush();
    p.requests[0].reject(new Error('old source failed'));
    p.requests[1].resolve();
    await flush();
    assert.equal(p.audio.src, '/track-1.mp3');
    assert.equal(p.status(), 'PLAYING');
    assert.equal(p.warnings.length, 0);
});

test('an interrupted seek retries once, and repeated cancellation never shows LOAD ERROR', async () => {
    const p = await player();
    p.click();
    p.audio.paused = true;
    p.requests[0].reject(Object.assign(new Error('seek interrupted play'), { name: 'AbortError' }));
    await flush();
    assert.equal(p.requests.length, 2);
    p.audio.paused = true;
    p.requests[1].reject(Object.assign(new Error('cancelled again'), { name: 'AbortError' }));
    await flush();
    assert.equal(p.requests.length, 2);
    assert.equal(p.status(), 'READY');
    assert.equal(p.pressed(), 'false');
});

test('a real media failure is logged and the next play retries the source at the same position', async () => {
    const p = await player();
    p.click();
    p.requests[0].resolve();
    await flush();
    p.audio.currentTime = 123;
    p.audio.error = { code: 2, message: 'network connection lost' };
    p.audio.emit('error');
    await flush();
    assert.equal(p.status(), 'LOAD ERROR');
    assert.equal(p.audio.paused, true);
    assert.equal(p.warnings.length, 1);
    p.click();
    await flush();
    assert.equal(p.loads.length, 2);
    p.audio.emit('loadedmetadata');
    p.requests[1].resolve();
    await flush();
    assert.equal(p.audio.currentTime, 123);
    assert.equal(p.status(), 'PLAYING');
});

test('autoplay denial requests another click without reloading a valid file', async () => {
    const p = await player();
    p.click();
    p.audio.paused = true;
    p.requests[0].reject(Object.assign(new Error('user gesture required'), { name: 'NotAllowedError' }));
    await flush();
    assert.equal(p.status(), 'PRESS PLAY');
    p.click();
    p.requests[1].resolve();
    await flush();
    assert.equal(p.loads.length, 1);
    assert.equal(p.status(), 'PLAYING');
});

test('seek completion preserves playing and paused intent', async () => {
    const p = await player();
    p.audio.emit('seeked');
    assert.equal(p.requests.length, 0);
    p.click();
    p.requests[0].resolve();
    await flush();
    p.audio.seeking = true;
    p.audio.pause();
    await flush();
    assert.equal(p.pressed(), 'true');
    p.audio.seeking = false;
    p.audio.emit('seeked');
    p.requests[1].resolve();
    await flush();
    assert.equal(p.status(), 'PLAYING');
    p.click();
    await flush();
    p.audio.emit('seeked');
    assert.equal(p.requests.length, 2);
    assert.equal(p.status(), 'READY');
});

test('browser or OS pause is respected instead of forcing playback back on', async () => {
    const p = await player();
    p.click();
    p.requests[0].resolve();
    await flush();
    p.audio.pause();
    await flush();
    assert.equal(p.pressed(), 'false');
    assert.equal(p.status(), 'READY');
    assert.equal(p.requests.length, 1);
});

test('switching tracks cancels the obsolete download before loading the selected file', async () => {
    const p = await player();
    p.tracks[0].emit('click');
    p.tracks[1].emit('click');
    await flush();
    assert.equal(p.downloads[1].signal.aborted, true);
    assert.equal(p.loads.length, 2);
    assert.equal(p.audio.src, '/track-1.mp3');
    p.requests[0].resolve();
    await flush();
    assert.equal(p.status(), 'PLAYING');
});
