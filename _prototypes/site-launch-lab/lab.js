"use strict";

const fonts = {
  departure: { name: "Departure Mono", size: "22px", source: "https://departuremono.com/", description: "Crisp, measured, unapologetically pixel. My first choice to try.", advice: "Departure Mono: my first pick for a distinctly pixel body. Try a full paragraph, not just a label. Its designer recommends multiples of 11px for a crisp grid." },
  pixelify: { name: "Pixelify Sans", size: "20px", source: "https://github.com/eifetx/Pixelify-Sans", description: "Proportional pixel letters; softer and less terminal-like.", advice: "Pixelify Sans: the second candidate I would try. Proportional spacing gives the text a less mechanical rhythm while retaining visibly pixel-shaped letters." },
  plex: { name: "IBM Plex Mono", size: "18px", source: "https://github.com/IBM/plex", description: "The reading-first compromise: technical, but not a bitmap face.", advice: "IBM Plex Mono: the restrained option. It connects to code and patching environments without turning every paragraph into an 8-bit display." },
  vt323: { name: "VT323", size: "24px", source: "https://github.com/phoikoi/VT323", description: "Narrow terminal lettering, based on the DEC VT320.", advice: "VT323: a strong terminal atmosphere. It needs a larger nominal size; compare punctuation and longer lines before choosing it for the whole biography." },
  doto: { name: "Doto", size: "22px · 600", source: "https://github.com/google/fonts/tree/main/ofl/doto", description: "The dot-matrix extreme. Worth seeing, but my pick for accents only.", advice: "Doto: unmistakably dot matrix. The broken strokes make sustained reading more demanding for me; I would reserve it for short details, not all body text." },
  serif: { name: "Source Serif 4", size: "17.28px", source: "https://github.com/adobe-fonts/source-serif", description: "The current pixel body face and appointment-section size.", advice: "Source Serif 4: the current baseline. The contrast with Silkscreen headings is intentionally editorial; keep it if the pixel alternatives become tiring over a whole page." }
};
const noticeAdvice = {
  inline: "A · A quiet note in the reading flow. It explains what is still growing without blocking the content.",
  strip: "B · More visible on arrival, but competes with navigation. A good alternative if the inline note feels too prominent within the introduction.",
  corner: "C · Feels like a small personal note. It can obscure content on desktop; here it is contained inside the mock page and moves into the flow on mobile.",
  modal: "D · Explicit, but interrupts the visit for information that needs no decision. Included for comparison; click Preview popup to open it.",
  none: "No notice · The persistent footer note may be sufficient if the published pages already feel complete."
};
const preview = document.querySelector("#preview");
const fontSelect = document.querySelector("#font-choice");
const noticeSelect = document.querySelector("#notice-choice");
const resetNotice = document.querySelector("#reset-notice");
const dialog = document.querySelector("#notice-dialog");
const status = document.querySelector("#lab-status");
const grid = document.querySelector("#font-grid");

Object.entries(fonts).forEach(([key, font]) => {
  const card = document.createElement("article");
  card.className = "font-card";
  card.dataset.font = key;
  // This markup is fixed local specimen content, not user or remote input.
  card.innerHTML = `<header><h3>${font.name}</h3><span class="font-size">${font.size}</span></header>
    <p class="description">${font.description}</p>
    <div class="specimen"><p>Today, I often encounter a source through a scan rather than a printed volume I can hold, touch, and feel. That distance makes a carefully prepared encoding, explicitly linked back to the facsimile, feel like the least we can do to treat the source with respect.</p><p class="glyphs">Buxtehude · Denkmäler · œuvre<br>MEI / CAMAT — 2025–2028<br>“What do we preserve?”</p></div>
    <footer><button type="button" data-use-font="${key}">Try in the page ↑</button><a href="${font.source}" target="_blank" rel="noopener">Font source ↗</a></footer>`;
  grid.append(card);
});

function updateFont() {
  preview.dataset.font = fontSelect.value;
  document.querySelector("#font-advice").textContent = fonts[fontSelect.value].advice;
  grid.querySelectorAll(".font-card").forEach(card => {
    const active = card.dataset.font === fontSelect.value;
    card.classList.toggle("is-selected", active);
    card.querySelector("button").setAttribute("aria-pressed", String(active));
  });
}
function updateNotice() {
  const choice = noticeSelect.value;
  document.querySelectorAll("[data-notice]").forEach(el => { el.hidden = el.dataset.notice !== choice; });
  document.querySelector("#notice-advice").textContent = noticeAdvice[choice];
  resetNotice.textContent = choice === "modal" ? "Preview popup" : "Show notice again";
  resetNotice.hidden = choice === "none";
  status.textContent = "";
}
fontSelect.addEventListener("change", updateFont);
noticeSelect.addEventListener("change", updateNotice);
document.querySelector("#theme-choice").addEventListener("change", event => {
  document.documentElement.dataset.theme = event.target.value;
});
document.querySelector("#mode-choice").addEventListener("change", event => {
  preview.dataset.mode = event.target.value;
  preview.querySelector(".view-label").textContent = `${event.target.value === "plain" ? "Plain" : "Pixel"} view`;
  fontSelect.disabled = event.target.value === "plain";
  status.textContent = event.target.value === "plain" ? "Plain view keeps the current IBM Plex Sans body. The comparison cards below still show the pixel alternatives." : "";
});
document.querySelector("#size-choice").addEventListener("change", event => {
  preview.dataset.size = event.target.value;
  grid.dataset.size = event.target.value;
  grid.querySelectorAll(".font-card").forEach(card => {
    card.querySelector(".font-size").textContent = event.target.value === "equal" ? "22px" : fonts[card.dataset.font].size;
  });
});
resetNotice.addEventListener("click", () => {
  if (noticeSelect.value === "modal") dialog.showModal();
  else updateNotice();
});
document.querySelectorAll(".dismiss").forEach(button => button.addEventListener("click", () => {
  button.closest("[data-notice]").hidden = true;
  resetNotice.focus();
  status.textContent = "Notice dismissed in this preview. Use Show notice again to restore it.";
}));
grid.addEventListener("click", event => {
  const button = event.target.closest("[data-use-font]");
  if (!button) return;
  fontSelect.value = button.dataset.useFont;
  document.querySelector("#mode-choice").value = "pixel";
  preview.dataset.mode = "pixel";
  preview.querySelector(".view-label").textContent = "Pixel view";
  fontSelect.disabled = false;
  updateFont();
  document.querySelector(".lab-controls").scrollIntoView({ block: "start" });
  fontSelect.focus({ preventScroll: true });
  status.textContent = `${fonts[fontSelect.value].name} is now shown in the page preview.`;
});
updateFont();
updateNotice();
