document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameTimer = 0;

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
        root.dataset.theme = theme;
        if (persist) saveTheme(theme);

        if (toggle) {
            const dark = theme === 'dark';
            toggle.setAttribute('aria-pressed', String(dark));
            toggle.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
        }
    };

    const initialTheme = readSavedTheme() || (systemPreference.matches ? 'dark' : 'light');
    applyTheme(initialTheme);

    const animatePixelTheme = (theme) => {
        window.clearTimeout(frameTimer);

        const currentFrame = Number.parseInt(root.dataset.themeFrame, 10);
        const targetFrame = theme === 'dark' ? 4 : 0;
        const fallbackFrame = root.dataset.theme === 'dark' ? 4 : 0;
        let frame = Number.isNaN(currentFrame) ? fallbackFrame : currentFrame;

        if (root.dataset.chrome !== 'on' || reducedMotion.matches || frame === targetFrame) {
            delete root.dataset.themeFrame;
            applyTheme(theme, true);
            return;
        }

        const direction = targetFrame > frame ? 1 : -1;
        root.dataset.themeFrame = String(frame);
        applyTheme(theme, true);

        const advance = () => {
            frame += direction;
            root.dataset.themeFrame = String(frame);

            if (frame === targetFrame) {
                frameTimer = window.setTimeout(() => {
                    delete root.dataset.themeFrame;
                    frameTimer = 0;
                }, 55);
            } else {
                frameTimer = window.setTimeout(advance, 55);
            }
        };

        frameTimer = window.setTimeout(advance, 55);
    };

    toggle?.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        animatePixelTheme(nextTheme);
    });

    systemPreference.addEventListener?.('change', (event) => {
        if (!readSavedTheme()) {
            delete root.dataset.themeFrame;
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });
});
