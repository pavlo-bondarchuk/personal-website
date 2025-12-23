"use strict";

function initSmartStickyHeader() {
  const header = document.getElementById("siteHeader");
  const spacer = document.getElementById("headerSpacer");
  if (!header || !spacer) return;

  let lastY = window.scrollY || 0;
  let ticking = false;
  const threshold = 4;
  const overshootPx = 10;
  const overshootDelayMs = 140;
  let showTimer = null;

  function getHeaderHeight() {
    return header.offsetHeight || 0;
  }

  function setSpacerHeight(px) {
    spacer.style.height = `${Math.max(0, Math.round(px))}px`;
  }

  function clearShowTimer() {
    if (showTimer) {
      window.clearTimeout(showTimer);
      showTimer = null;
    }
  }

  function showHeader(withOvershoot) {
    clearShowTimer();
    const headerH = getHeaderHeight();

    // Keep content from sitting under the fixed header.
    setSpacerHeight(headerH);

    if (!withOvershoot) {
      header.style.top = "0px";
      return;
    }

    // Slightly overshoot down, then smoothly settle to 0.
    header.style.top = `${overshootPx}px`;
    showTimer = window.setTimeout(() => {
      header.style.top = "0px";
      showTimer = null;
    }, overshootDelayMs);
  }

  function hideHeader() {
    clearShowTimer();
    const headerH = getHeaderHeight();
    header.style.top = `-${headerH}px`;
    setSpacerHeight(0);
  }

  function update() {
    const y = window.scrollY || 0;
    const headerH = getHeaderHeight();

    // At the top of the page, always show header in the normal position.
    if (y <= headerH) {
      showHeader(false);
      lastY = y;
      return;
    }

    const delta = y - lastY;
    if (Math.abs(delta) < threshold) return;

    if (delta < 0) {
      // Scrolling up => show with a bit of “top-down” feel.
      showHeader(true);
    } else {
      // Scrolling down => hide by moving above the viewport.
      hideHeader();
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

  window.addEventListener("resize", () => {
    // Re-apply current state using the updated header height.
    update();
  });

  // Initialize: show at top, otherwise start hidden.
  if ((window.scrollY || 0) <= getHeaderHeight()) {
    showHeader(false);
  } else {
    hideHeader();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSmartStickyHeader();
});
