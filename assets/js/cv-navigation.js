/* Native details/summary provides the disclosure, including without JavaScript.
   Enhance dismissal and move keyboard focus to the chosen section. */
(function () {
    'use strict';

    var jump = document.querySelector('.cv-jump');
    if (!jump) return;
    var summary = jump.querySelector('summary');

    jump.addEventListener('click', function (event) {
        var link = event.target.closest('a[href^="#"]');
        if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        var section = document.getElementById(link.hash.slice(1));
        if (!section) return;
        jump.open = false;
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        // Keep the anchor's native hash/history and scroll behaviour.
    });

    document.addEventListener('click', function (event) {
        if (jump.open && !jump.contains(event.target)) jump.open = false;
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' || !jump.open) return;
        jump.open = false;
        summary.focus();
        event.preventDefault();
    });
}());
