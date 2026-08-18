(function () {
    try {
        var savedTheme = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.dataset.theme = savedTheme || (prefersDark ? 'dark' : 'light');
    } catch (_error) {
        document.documentElement.dataset.theme = 'light';
    }

    // Studio chrome is on unless it has been switched off. Restored here,
    // before first paint, so the site never flashes the wrong state on load.
    try {
        document.documentElement.dataset.chrome =
            localStorage.getItem('chrome') === 'off' ? 'off' : 'on';
    } catch (_error) {
        document.documentElement.dataset.chrome = 'on';
    }
}());
