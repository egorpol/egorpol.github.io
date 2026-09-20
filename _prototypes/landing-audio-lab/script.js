(function () {
  'use strict';

  var tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  var panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function selectTab(tab) {
    tabs.forEach(function (candidate) {
      var selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== tab.dataset.tab;
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var offset = event.key === 'ArrowRight' ? 1 : -1;
      var next = tabs[(index + offset + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  function formatTime(seconds, pixel) {
    var whole = Math.floor(seconds);
    var minutes = Math.floor(whole / 60);
    return (pixel ? String(minutes).padStart(2, '0') : minutes) + ':' + String(whole % 60).padStart(2, '0');
  }

  function createWaveformSamples(length) {
    var seed = 1979;
    var samples = new Float32Array(length);

    function random() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    for (var index = 0; index < length; index += 1) {
      var position = index / (length - 1);
      var firstPhrase = 0.82 * Math.exp(-Math.pow((position - 0.2) / 0.14, 2));
      var secondPhrase = 0.94 * Math.exp(-Math.pow((position - 0.58) / 0.095, 2));
      var tail = 0.7 * Math.exp(-Math.pow((position - 0.76) / 0.15, 2));
      var edgeFade = Math.pow(Math.sin(Math.PI * position), 0.55);
      var envelope = Math.min(1, (0.035 + firstPhrase + secondPhrase + tail) * edgeFade);
      var tone = Math.sin(index * 0.21) * 0.28 + Math.sin(index * 0.071) * 0.18;
      var noise = (random() * 2 - 1) * 0.72;
      samples[index] = Math.max(-1, Math.min(1, envelope * (tone + noise)));
    }

    return samples;
  }

  var waveformSamples = createWaveformSamples(8192);

  document.querySelectorAll('.pd-wave-scrub').forEach(function (waveform) {
    var canvas = waveform.querySelector('.pd-waveform-canvas');
    var scheduled = false;

    function drawWaveform() {
      scheduled = false;
      var width = Math.max(1, Math.round(waveform.clientWidth));
      var height = Math.max(1, Math.round(waveform.clientHeight));
      var ratio = Math.max(1, window.devicePixelRatio || 1);
      var context = canvas.getContext('2d');

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.strokeStyle = getComputedStyle(waveform).getPropertyValue('--pd-ink').trim() || '#102b3f';
      context.lineWidth = 1;
      context.beginPath();

      for (var x = 0; x < width; x += 1) {
        var start = Math.floor(x / width * waveformSamples.length);
        var end = Math.max(start + 1, Math.floor((x + 1) / width * waveformSamples.length));
        var minimum = 1;
        var maximum = -1;

        for (var sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
          minimum = Math.min(minimum, waveformSamples[sampleIndex]);
          maximum = Math.max(maximum, waveformSamples[sampleIndex]);
        }

        context.moveTo(x + 0.5, height / 2 + minimum * height * 0.46);
        context.lineTo(x + 0.5, height / 2 + maximum * height * 0.46);
      }

      context.stroke();
    }

    function scheduleDraw() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(drawWaveform);
    }

    new ResizeObserver(scheduleDraw).observe(waveform);
    scheduleDraw();
  });

  document.querySelectorAll('.demo-player').forEach(function (player) {
    var duration = Number(player.dataset.duration);
    var current = 0;
    var timer = null;
    var button = player.querySelector('.play-toggle');
    var readout = player.querySelector('.time-readout');
    var status = player.querySelector('.pd-status');
    var pixel = player.classList.contains('pd-player');

    function render() {
      player.style.setProperty('--progress', (current / duration * 100) + '%');
      readout.textContent = pixel
        ? formatTime(current, true) + ' / ' + formatTime(duration, true)
        : formatTime(current, false) + ' / ' + formatTime(duration, false);
      var waveformSeek = player.querySelector('.pd-wave-scrub');
      if (waveformSeek) {
        waveformSeek.setAttribute('aria-valuenow', current.toFixed(1));
        waveformSeek.setAttribute('aria-valuetext', formatTime(current, true) + ' of ' + formatTime(duration, true));
      }
      if (player.classList.contains('pd-monitor')) {
        player.querySelectorAll('.pd-meters i').forEach(function (meter, meterIndex) {
          var level = player.classList.contains('is-playing') ? 22 + ((current * (17 + meterIndex * 7)) % 66) : 8;
          meter.style.height = level + '%';
        });
      }
    }

    function setPlaying(playing) {
      player.classList.toggle('is-playing', playing);
      button.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + (player.dataset.track || player.querySelector('h4')?.textContent || 'excerpt'));
      if (button.classList.contains('pd-toggle')) button.setAttribute('aria-pressed', String(playing));
      if (button.classList.contains('plain-play')) button.querySelector('span').textContent = playing ? 'Ⅱ' : '▶';
      if (button.classList.contains('pd-message')) button.textContent = playing ? 'STOP 0' : 'PLAY 1';
      if (status) status.textContent = playing ? 'PLAYING' : 'READY';
      clearInterval(timer);
      if (playing) {
        timer = setInterval(function () {
          current += 0.2;
          if (current >= duration) { current = 0; setPlaying(false); }
          render();
        }, 200);
      }
      render();
    }

    button.addEventListener('click', function () { setPlaying(!player.classList.contains('is-playing')); });
    player.querySelectorAll('.wave-scrub,.line-scrub,.pd-slider,.pd-wave-scrub').forEach(function (scrub) {
      scrub.addEventListener('click', function (event) {
        var bounds = scrub.getBoundingClientRect();
        current = Math.max(0, Math.min(duration, (event.clientX - bounds.left) / bounds.width * duration));
        render();
      });
      if (scrub.classList.contains('pd-wave-scrub')) {
        scrub.addEventListener('keydown', function (event) {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          if (event.key === 'Home') current = 0;
          else if (event.key === 'End') current = duration;
          else current = Math.max(0, Math.min(duration, current + (event.key === 'ArrowRight' ? 1 : -1)));
          render();
        });
      }
    });
    render();
  });
}());
