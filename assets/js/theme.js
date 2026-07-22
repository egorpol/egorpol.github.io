document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');

    const readSavedTheme = () => {
        try {
            return localStorage.getItem('theme');
        } catch (_error) {
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            localStorage.setItem('theme', theme);
        } catch (_error) {
            // Theme persistence is optional when storage is unavailable.
        }
    };

    const applyTheme = (theme, persist = false) => {
        document.documentElement.dataset.theme = theme;
        if (persist) saveTheme(theme);

        if (toggle) {
            const dark = theme === 'dark';
            toggle.setAttribute('aria-pressed', String(dark));
            toggle.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
        }
    };

    const initialTheme = readSavedTheme() || (systemPreference.matches ? 'dark' : 'light');
    applyTheme(initialTheme);

    toggle?.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, true);
    });

    systemPreference.addEventListener?.('change', (event) => {
        if (!readSavedTheme()) applyTheme(event.matches ? 'dark' : 'light');
    });
});
