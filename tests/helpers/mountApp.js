import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import * as Vue from "vue";
import * as VueI18n from "vue-i18n";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

/**
 * The one template. Tests render the very markup index.html ships rather than a
 * copy, so a template edit that breaks a chip or the banner fails the suite
 * instead of drifting away from an out-of-date fixture.
 */
function appMarkup() {
  const html = readFileSync(resolve(repoRoot, "index.html"), "utf8");
  const open = html.indexOf('<div id="app">');
  const close = html.indexOf("</body>");

  if (open === -1 || close === -1 || close < open) {
    throw new Error(
      'Could not locate the <div id="app"> … </body> block in index.html — ' +
        "the harness extracts the live template from there."
    );
  }

  return html.slice(open, close).trimEnd();
}

/**
 * Boot app.js the way the browser does: globals in place, `#app` already in the
 * document, then import the module — which self-mounts on its last line.
 *
 * Returns DOM query helpers plus `tick()` for flushing Vue's render queue.
 */
export async function mountApp() {
  document.body.innerHTML = appMarkup();

  globalThis.Vue = Vue;

  // app.js keeps its message trees module-private and never exports the i18n
  // instance, so wrap the factory to capture what it was actually built with.
  // Nothing in app.js changes; the tests just get a handle on the real object.
  let i18n = null;
  globalThis.VueI18n = {
    ...VueI18n,
    createI18n(options) {
      i18n = VueI18n.createI18n(options);
      return i18n;
    },
  };

  const save = vi.fn();
  const autoTable = vi.fn();
  const text = vi.fn();
  const jsPDF = vi.fn(function jsPDFStub() {
    return {
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      text,
      autoTable,
      save,
    };
  });
  window.jspdf = { jsPDF };

  // app.js mounts as a side effect of being imported, so each test needs a fresh
  // module instance against its fresh document.
  vi.resetModules();
  await import("../../app.js");
  await Vue.nextTick();

  const root = document.querySelector("#app");

  const q = (selector) => root.querySelector(selector);
  const qa = (selector) => Array.from(root.querySelectorAll(selector));

  /** Find a <button> by the text it renders (chips, Export, custom toggles). */
  const buttonByText = (needle) =>
    qa("button").find((el) => el.textContent.replace(/\s+/g, " ").trim().includes(needle));

  /** Every chip in the group that follows the label containing `labelText`. */
  const chipsUnder = (labelText) => {
    const label = qa("label").find((el) => el.textContent.includes(labelText));
    if (!label) return [];
    return Array.from(label.parentElement.querySelectorAll("button"));
  };

  const chipByText = (labelText, needle) =>
    chipsUnder(labelText).find((el) =>
      el.textContent.replace(/\s+/g, " ").trim().includes(needle)
    );

  const tick = async () => {
    await Vue.nextTick();
    await Vue.nextTick();
  };

  /** Drive a v-model.number input the way a user typing into it would. */
  const setInput = async (selector, value) => {
    const el = q(selector);
    if (!el) throw new Error(`No input matched ${selector}`);
    el.value = String(value);
    el.dispatchEvent(new window.Event("input", { bubbles: true }));
    await tick();
  };

  // The three fuel/earnings inputs carry no id — they are identified by their
  // (untranslated) placeholders. Named helpers keep that detail out of the specs.
  const setFuelCost = (v) => setInput('input[placeholder="e.g. 60"]', v);
  const setFuelKm = (v) => setInput('input[placeholder="e.g. 400"]', v);
  const setEarningsPerKm = (v) => setInput('input[placeholder="e.g. 0.7"]', v);

  /** Switch the header locale <select>. */
  const setLocale = async (locale) => {
    const select = q("select");
    select.value = locale;
    select.dispatchEvent(new window.Event("change", { bubbles: true }));
    await tick();
  };

  const click = async (el) => {
    if (!el) throw new Error("click() received no element");
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await tick();
  };

  /** Collapsed text of the whole app, for whitespace-insensitive assertions. */
  const text_ = () => root.textContent.replace(/\s+/g, " ").trim();

  /** The results table as an array of row-cell-text arrays. */
  const rows = () =>
    qa("tbody tr").map((tr) =>
      Array.from(tr.querySelectorAll("td")).map((td) =>
        td.textContent.replace(/\s+/g, " ").trim()
      )
    );

  return {
    i18n,
    messages: i18n ? i18n.global.messages.value ?? i18n.global.messages : null,
    root,
    q,
    qa,
    tick,
    click,
    setInput,
    setFuelCost,
    setFuelKm,
    setEarningsPerKm,
    setLocale,
    rows,
    text: text_,
    buttonByText,
    chipsUnder,
    chipByText,
    pdf: { jsPDF, autoTable, save, text },
  };
}
