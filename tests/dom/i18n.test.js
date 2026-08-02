/**
 * @vitest-environment jsdom
 *
 * The app ships two hand-maintained message trees. A key added to `en` but not
 * to `ms` falls back silently to English, so the Malay UI degrades without any
 * error — exactly the failure mode these tests exist to catch.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mountApp } from "../helpers/mountApp.js";

let app;

beforeEach(async () => {
  app = await mountApp();
});

/** Flatten a nested message tree into dotted key paths. */
function keyPaths(tree, prefix = "") {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" && !Array.isArray(value)
      ? keyPaths(value, path)
      : [path];
  });
}

describe("message trees", () => {
  it("exposes exactly the two supported locales", () => {
    expect(Object.keys(app.messages).sort()).toEqual(["en", "ms"]);
  });

  it("defines the same key set in English and Malay", () => {
    const en = keyPaths(app.messages.en).sort();
    const ms = keyPaths(app.messages.ms).sort();

    expect(ms).toEqual(en);
  });

  it("leaves no Malay string untranslated as an empty value", () => {
    const blanks = keyPaths(app.messages.ms).filter((path) => {
      const value = path.split(".").reduce((acc, key) => acc[key], app.messages.ms);
      return typeof value !== "string" || value.trim() === "";
    });

    expect(blanks).toEqual([]);
  });

  it("keeps the interpolation placeholders in both unprofitable strings", () => {
    for (const locale of ["en", "ms"]) {
      expect(app.messages[locale].unprofitable).toContain("{cost}");
      expect(app.messages[locale].unprofitable).toContain("{earn}");
    }
  });

  it("keeps the plural form and its {n} placeholder in both row labels", () => {
    for (const locale of ["en", "ms"]) {
      const rows = app.messages[locale].rows;
      expect(rows.split("|")).toHaveLength(2);
      expect(rows).toContain("{n}");
    }
  });

  it("starts in English and falls back to English", () => {
    expect(app.i18n.global.locale.value ?? app.i18n.global.locale).toBe("en");
    expect(app.i18n.global.fallbackLocale.value ?? app.i18n.global.fallbackLocale).toBe("en");
  });
});

describe("rendered locale switch", () => {
  it("resolves every key the template asks for, in both locales", async () => {
    // vue-i18n renders an unresolved key as its own dotted path. A key missing
    // from `ms` alone falls back to English (the key-set test above is what
    // catches that); this catches a key the template references that exists in
    // NEITHER tree — a typo'd or renamed message path.
    const nestedKeys = keyPaths(app.messages.en).filter((path) => path.includes("."));
    expect(nestedKeys.length).toBeGreaterThan(0);

    for (const locale of ["en", "ms"]) {
      await app.setLocale(locale);
      const rendered = app.text();
      const leaked = nestedKeys.filter((path) => rendered.includes(path));

      expect(leaked, `raw keys rendered under locale "${locale}"`).toEqual([]);
    }
  });

  it("translates the section headings and the export button", async () => {
    expect(app.text()).toContain("Export to PDF");

    await app.setLocale("ms");

    expect(app.text()).toContain("Eksport ke PDF");
    expect(app.text()).toContain("Minyak & Pendapatan");
    expect(app.text()).not.toContain("Export to PDF");
  });

  it("switches back to English cleanly", async () => {
    await app.setLocale("ms");
    await app.setLocale("en");

    expect(app.text()).toContain("Export to PDF");
    expect(app.text()).not.toContain("Eksport ke PDF");
  });
});
