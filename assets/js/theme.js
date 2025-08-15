document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle button icons
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) {
            const sunIcon = themeToggleButton.querySelector('.sun-icon');
            const moonIcon = themeToggleButton.querySelector('.moon-icon');
            
            if (sunIcon && moonIcon) {
                if (theme === 'dark') {
                    sunIcon.style.opacity = '0';
                    moonIcon.style.opacity = '1';
                } else {
                    sunIcon.style.opacity = '1';
                    moonIcon.style.opacity = '0';
                }
            }
        }
    };

    const toggleTheme = () => {
        const currentTheme = localStorage.getItem('theme') || (systemPrefersDark.matches ? 'dark' : 'light');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme(systemPrefersDark.matches ? 'dark' : 'light');
        }
    };

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    systemPrefersDark.addEventListener('change', (e) => {
        setTheme(e.matches ? 'dark' : 'light');
    });

    loadTheme();
});