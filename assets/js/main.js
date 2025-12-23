"use strict";

function initSmartStickyHeader() {
  const header = document.getElementById("siteHeader");
  const spacer = document.getElementById("headerSpacer");
  if (!header || !spacer) return;

  let lastY = window.scrollY || 0;
  let ticking = false;
  const threshold = 4;
  let hideTimer = null;

  function setSticky(enabled) {
    if (enabled) {
      if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
      }

      header.classList.add("isSticky");
      spacer.style.height = `${header.offsetHeight}px`;

      // Next frame: trigger transition in.
      window.requestAnimationFrame(() => {
        header.classList.add("isShown");
      });
      return;
    }

    // Transition out first; then remove fixed positioning.
    header.classList.remove("isShown");
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      header.classList.remove("isSticky");
      spacer.style.height = "0px";
      hideTimer = null;
    }, 170);
  }

  function update() {
    const y = window.scrollY || 0;
    const headerH = header.offsetHeight || 0;

    // Near the top, keep the normal (non-sticky) header.
    if (y <= headerH) {
      setSticky(false);
      lastY = y;
      return;
    }

    const delta = y - lastY;
    if (Math.abs(delta) < threshold) return;

    if (delta < 0) {
      // Scrolling up => user likely wants header/nav.
      setSticky(true);
    } else {
      // Scrolling down => header not needed.
      setSticky(false);
    }

    lastY = y;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    },
    { passive: true }
  );

  update();
}

document.addEventListener("DOMContentLoaded", () => {
  initSmartStickyHeader();
});
