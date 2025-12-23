"use strict";

function initMobileMenu() {
  const header = document.getElementById("siteHeader");
  const menu = document.getElementById("mobileMenu");
  const toggle = document.getElementById("menuToggle");

  if (!header || !menu || !toggle) return;

  const mobileMq = window.matchMedia("(max-width: 900px)");
  let scrollRaf = 0;

  function setMenuTop() {
    const rect = header.getBoundingClientRect();
    const top = Math.max(0, Math.round(rect.bottom));
    document.documentElement.style.setProperty("--mobileMenuTop", `${top}px`);
  }

  function openMenu() {
    if (!mobileMq.matches) return;
    setMenuTop();
    menu.hidden = false;
    document.body.classList.add("isMenuOpen");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.hidden = true;
    document.body.classList.remove("isMenuOpen");
    toggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const isOpen = document.body.classList.contains("isMenuOpen");
    if (isOpen) closeMenu();
    else openMenu();
  }

  toggle.addEventListener("click", toggleMenu);

  menu.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target instanceof Element && target.closest("a[href]")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!document.body.classList.contains("isMenuOpen")) return;
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        setMenuTop();
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (!mobileMq.matches) {
      closeMenu();
      return;
    }
    if (document.body.classList.contains("isMenuOpen")) setMenuTop();
  });

  mobileMq.addEventListener("change", () => {
    if (!mobileMq.matches) closeMenu();
  });
}

document.addEventListener("DOMContentLoaded", initMobileMenu);
