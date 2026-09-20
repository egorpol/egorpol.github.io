/* No browser dependencies: exercise notice persistence and storage fallback. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/site-notice.js'), 'utf8');
const key = 'site-notice-dismissed';

function setup({ saved, blocked = false, version = 'archive-growing-v1', ready = 'loading' } = {}) {
    const values = new Map(saved ? [[key, saved]] : []);
    function element(hidden = false) {
        return {
            hidden,
            listeners: {},
            addEventListener(type, fn) { this.listeners[type] = fn; },
            focus() { this.focused = true; }
        };
    }
    const dismiss = element(true);
    const restore = element(true);
    const heading = element();
    const notice = Object.assign(element(), {
        dataset: { version },
        querySelector: () => dismiss
    });
    const document = {
        readyState: ready,
        querySelector: selector => selector === '[data-site-notice]' ? notice : restore,
        getElementById: () => heading,
        addEventListener(type, fn) { if (type === 'DOMContentLoaded') this.ready = fn; }
    };
    const localStorage = {
        getItem(name) { if (blocked) throw Error('Storage blocked'); return values.get(name); },
        setItem(name, value) { if (blocked) throw Error('Storage blocked'); values.set(name, value); },
        removeItem(name) { if (blocked) throw Error('Storage blocked'); values.delete(name); }
    };
    vm.runInNewContext(source, { document, localStorage });
    if (document.ready) document.ready();
    return { notice, dismiss, restore, heading, values };
}

let state = setup();
assert.equal(state.notice.hidden, false);
assert.equal(state.dismiss.hidden, false);
assert.equal(state.restore.hidden, true);
state.dismiss.listeners.click();
assert.equal(state.notice.hidden, true);
assert.equal(state.restore.hidden, false);
assert.equal(state.heading.focused, true);
assert.equal(state.values.get(key), 'archive-growing-v1');

state = setup({ saved: state.values.get(key) });
assert.equal(state.notice.hidden, true, 'Dismissal persists on the next visit');
state.restore.listeners.click();
assert.equal(state.notice.hidden, false);
assert.equal(state.restore.hidden, true);
assert.equal(state.dismiss.focused, true);
assert.equal(state.values.has(key), false);

assert.equal(setup({ saved: 'archive-growing-v1', version: 'archive-growing-v2' }).notice.hidden, false);
assert.equal(setup({ saved: 'archive-growing-v1', ready: 'complete' }).notice.hidden, true);
state = setup({ blocked: true });
state.dismiss.listeners.click();
assert.equal(state.notice.hidden, true);
state.restore.listeners.click();
assert.equal(state.notice.hidden, false);

vm.runInNewContext(source, { document: { querySelector: () => null } });
console.log('Site notice: dismissal, restoration, versioning, storage fallback, and focus checks passed.');
