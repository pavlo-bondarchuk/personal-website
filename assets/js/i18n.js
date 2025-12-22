"use strict";

function getQueryLang() {
  const params = new URLSearchParams(window.location.search);
  const lang = (params.get("lang") || "").toLowerCase();
  if (lang === "en" || lang === "uk") return lang;
  return null;
}

function normalizeLang(lang) {
  const v = String(lang || "").toLowerCase();
  return v === "en" ? "en" : "uk";
}

function getInitialLang() {
  const urlLang = getQueryLang();
  if (urlLang) return urlLang;

  try {
    const stored = (localStorage.getItem("lang") || "").toLowerCase();
    if (stored === "en" || stored === "uk") return stored;
  } catch {
    // ignore
  }

  const browserLang = (navigator.language || "").toLowerCase();
  if (browserLang.startsWith("en")) return "en";
  return "uk";
}

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, part) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, part))
      return acc[part];
    return undefined;
  }, obj);
}

function applyTranslations(dict) {
  const textNodes = document.querySelectorAll("[data-i18n]");
  for (const el of textNodes) {
    const key = el.getAttribute("data-i18n");
    const val = getByPath(dict, key);
    if (typeof val === "string") {
      el.textContent = val;
    } else if (val === undefined) {
      console.warn(`[i18n] Missing key: ${key}`);
    }
  }

  const htmlNodes = document.querySelectorAll("[data-i18n-html]");
  for (const el of htmlNodes) {
    const key = el.getAttribute("data-i18n-html");
    const val = getByPath(dict, key);
    if (typeof val === "string") {
      el.innerHTML = val;
    } else if (val === undefined) {
      console.warn(`[i18n] Missing key: ${key}`);
    }
  }

  const placeholderNodes = document.querySelectorAll("[data-i18n-placeholder]");
  for (const el of placeholderNodes) {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = getByPath(dict, key);
    if (typeof val === "string") {
      el.setAttribute("placeholder", val);
    } else if (val === undefined) {
      console.warn(`[i18n] Missing key: ${key}`);
    }
  }

  const altNodes = document.querySelectorAll("[data-i18n-alt]");
  for (const el of altNodes) {
    const key = el.getAttribute("data-i18n-alt");
    const val = getByPath(dict, key);
    if (typeof val === "string") {
      el.setAttribute("alt", val);
    } else if (val === undefined) {
      console.warn(`[i18n] Missing key: ${key}`);
    }
  }

  if (dict && dict.meta && typeof dict.meta.title === "string") {
    document.title = dict.meta.title;
  }
  if (dict && dict.meta && typeof dict.meta.description === "string") {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", dict.meta.description);
  }
}

function setActiveLangButton(lang) {
  const buttons = document.querySelectorAll(".langBtn[data-lang]");
  for (const btn of buttons) {
    const isActive = btn.getAttribute("data-lang") === lang;
    btn.classList.toggle("isActive", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function updateUrlLang(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url.toString());
}

async function loadLanguage(lang) {
  const nextLang = normalizeLang(lang);

  let dict;
  try {
    const res = await fetch(`./i18n/${nextLang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dict = await res.json();
  } catch (err) {
    console.warn(`[i18n] Failed to load ./i18n/${nextLang}.json`, err);
    return;
  }

  applyTranslations(dict);
  document.documentElement.setAttribute("lang", nextLang);
  setActiveLangButton(nextLang);

  try {
    localStorage.setItem("lang", nextLang);
  } catch {
    // ignore
  }

  updateUrlLang(nextLang);
}

function initI18n() {
  const buttons = document.querySelectorAll(".langBtn[data-lang]");
  for (const btn of buttons) {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang") || "uk";
      loadLanguage(lang);
    });
  }

  const initial = getInitialLang();
  setActiveLangButton(initial);
  loadLanguage(initial);
}

document.addEventListener("DOMContentLoaded", initI18n);
