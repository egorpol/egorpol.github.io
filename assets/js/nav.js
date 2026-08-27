(function () {
    'use strict';

    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    // Only collapse the menu once the control is available, so the no-JS
    // fallback keeps every link reachable.
    nav.setAttribute('data-collapsible', 'true');
    toggle.hidden = false;

    function setOpen(open) {
        toggle.setAttribute('aria-expanded', String(open));
        if (open) {
            nav.setAttribute('data-open', 'true');
        } else {
            nav.removeAttribute('data-open');
        }
    }

    toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });

    // Reset state when the layout returns to the full-width navigation.
    var wide = window.matchMedia('(min-width: 1381px)');
    var onChange = function (event) {
        if (event.matches) setOpen(false);
    };
    if (wide.addEventListener) {
        wide.addEventListener('change', onChange);
    } else if (wide.addListener) {
        wide.addListener(onChange);
    }
})();
