(function () {
    'use strict';

    var notice = document.querySelector('[data-site-notice]');
    if (!notice) return;

    var key = 'site-notice-dismissed';
    var version = notice.dataset.version;
    var dismiss = notice.querySelector('.site-notice-dismiss');
    var restore;

    // Runs immediately after the notice markup to restore dismissal before
    // the rest of the page renders. Without JS, the readable note remains.
    try {
        notice.hidden = localStorage.getItem(key) === version;
    } catch (_error) {
        // Reading the site never depends on storage being available.
    }
    dismiss.hidden = false;

    dismiss.addEventListener('click', function () {
        notice.hidden = true;
        if (restore) restore.hidden = false;
        try {
            localStorage.setItem(key, version);
        } catch (_error) {
            // Dismissal still works for this visit.
        }
        var heading = document.getElementById('hero-title');
        if (heading) heading.focus({ preventScroll: true });
    });

    function bindRestore() {
        restore = document.querySelector('[data-site-notice-restore]');
        if (!restore) return;
        restore.hidden = !notice.hidden;
        restore.addEventListener('click', function () {
            try {
                localStorage.removeItem(key);
            } catch (_error) {
                // Restoring the note does not require storage either.
            }
            notice.hidden = false;
            restore.hidden = true;
            dismiss.focus();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindRestore, { once: true });
    } else {
        bindRestore();
    }
}());
