(function () {
    try {
        var savedTheme = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.dataset.theme = savedTheme || (prefersDark ? 'dark' : 'light');
    } catch (_error) {
        document.documentElement.dataset.theme = 'light';
    }
}());
