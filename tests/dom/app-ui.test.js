/**
 * @vitest-environment jsdom
 *
 * DOM-level cover for the view layer. `tests/calc.test.js` pins the pure math in
 * lib/calc.js; everything between that module and the screen — the chip toggle
 * groups, the unprofitable banner, the results table, the export button — had no
 * assertions at all, including the whole of commit 9edaa87 which introduced the
 * chips.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountApp } from "../helpers/mountApp.js";

const NET_TARGET = "Net Income Targets";
const WORKING_DAYS = "Working Days per Month";

let app;

beforeEach(async () => {
  app = await mountApp();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("initial render", () => {
  it("renders the preset chips for both groups", () => {
    const incomeChips = app.chipsUnder(NET_TARGET).map((el) => el.textContent.trim());
    const dayChips = app.chipsUnder(WORKING_DAYS).map((el) => el.textContent.trim());

    expect(incomeChips.some((t) => t.includes("3,500"))).toBe(true);
    expect(incomeChips.some((t) => t.includes("4,000"))).toBe(true);
    expect(dayChips.some((t) => t.includes("20"))).toBe(true);
    expect(dayChips.some((t) => t.includes("24"))).toBe(true);
  });

  it("marks exactly the default selections as pressed", () => {
    const pressed = (labelText) =>
      app
        .chipsUnder(labelText)
        .filter((el) => el.getAttribute("aria-pressed") === "true")
        .map((el) => el.textContent.replace(/\s+/g, " ").trim());

    expect(pressed(NET_TARGET)).toHaveLength(1);
    expect(pressed(NET_TARGET)[0]).toContain("3,500");
    expect(pressed(WORKING_DAYS)).toHaveLength(1);
    expect(pressed(WORKING_DAYS)[0]).toContain("20");
  });

  it("renders one results row for the single default combination", () => {
    const rows = app.rows();
    expect(rows).toHaveLength(1);
    // days, net target, net/day, required km/day, gross/day, gross/month
    expect(rows[0][0]).toBe("20");
    expect(rows[0][3]).toContain("319");
  });
});

describe("chip toggles", () => {
  it("selecting a second income target adds its combinations", async () => {
    expect(app.rows()).toHaveLength(1);

    await app.click(app.chipByText(NET_TARGET, "4,000"));

    expect(app.rows()).toHaveLength(2);
    expect(app.chipByText(NET_TARGET, "4,000").getAttribute("aria-pressed")).toBe("true");
  });

  it("deselecting a chip removes its combinations again", async () => {
    await app.click(app.chipByText(NET_TARGET, "4,000"));
    expect(app.rows()).toHaveLength(2);

    await app.click(app.chipByText(NET_TARGET, "4,000"));

    expect(app.rows()).toHaveLength(1);
    expect(app.chipByText(NET_TARGET, "4,000").getAttribute("aria-pressed")).toBe("false");
  });

  it("crosses every selected income with every selected day count", async () => {
    await app.click(app.chipByText(NET_TARGET, "4,000"));
    await app.click(app.chipByText(WORKING_DAYS, "24"));

    expect(app.rows()).toHaveLength(4);
  });

  it("deselecting the last day chip empties the table and shows the empty state", async () => {
    await app.click(app.chipByText(WORKING_DAYS, "20"));

    expect(app.rows()).toHaveLength(0);
    expect(app.text()).toContain("No combinations yet");
  });

  it("switching the custom income chip on seeds exactly one empty input", async () => {
    expect(app.qa('input[placeholder="Enter custom income"]')).toHaveLength(0);

    await app.click(app.chipByText(NET_TARGET, "Custom"));

    expect(app.qa('input[placeholder="Enter custom income"]')).toHaveLength(1);
  });

  it("seeds the custom input only the first time the chip is switched on", async () => {
    const customChip = () => app.chipByText(NET_TARGET, "Custom");

    await app.click(customChip());
    await app.click(customChip()); // off — inputs hide but the value survives
    await app.click(customChip()); // on again

    expect(app.qa('input[placeholder="Enter custom income"]')).toHaveLength(1);
  });

  it("hides the custom inputs while the custom chip is off", async () => {
    await app.click(app.chipByText(NET_TARGET, "Custom"));
    expect(app.qa('input[placeholder="Enter custom income"]')).toHaveLength(1);

    await app.click(app.chipByText(NET_TARGET, "Custom"));

    expect(app.qa('input[placeholder="Enter custom income"]')).toHaveLength(0);
  });

  it("a filled custom income produces its own results row", async () => {
    await app.click(app.chipByText(NET_TARGET, "Custom"));
    await app.setInput('input[placeholder="Enter custom income"]', 5000);

    const netTargets = app.rows().map((cells) => cells[1]);
    expect(netTargets).toHaveLength(2);
    expect(netTargets.some((t) => t.includes("5000") || t.includes("5,000"))).toBe(true);
  });

  it("an unfilled custom input contributes no row", async () => {
    await app.click(app.chipByText(NET_TARGET, "Custom"));

    expect(app.rows()).toHaveLength(1);
  });

  it("the custom days chip seeds and feeds the days column", async () => {
    await app.click(app.chipByText(WORKING_DAYS, "Custom"));
    await app.setInput('input[placeholder="Enter custom days"]', 26);

    const dayCells = app.rows().map((cells) => cells[0]);
    expect(dayCells).toContain("26");
  });
});

describe("unprofitable banner", () => {
  it("is hidden for the profitable default inputs", () => {
    expect(app.q('[data-test="unprofitable-warning"]')).toBeNull();
  });

  it("appears when fuel cost per km rises to meet earnings per km", async () => {
    // 60 / 400 = 0.15 per km; drop earnings to exactly that -> break-even.
    await app.setEarningsPerKm(0.15);

    expect(app.q('[data-test="unprofitable-warning"]')).not.toBeNull();
  });

  it("appears when fuel cost per km exceeds earnings per km", async () => {
    await app.setEarningsPerKm(0.1);

    expect(app.q('[data-test="unprofitable-warning"]')).not.toBeNull();
  });

  it("names the actual cost and earnings figures in the warning", async () => {
    await app.setEarningsPerKm(0.1);

    const banner = app.q('[data-test="unprofitable-warning"]').textContent;
    expect(banner).toContain("0.15");
    expect(banner).toContain("0.10");
  });

  it("disappears again once earnings per km clears the fuel cost", async () => {
    await app.setEarningsPerKm(0.1);
    expect(app.q('[data-test="unprofitable-warning"]')).not.toBeNull();

    await app.setEarningsPerKm(0.7);

    expect(app.q('[data-test="unprofitable-warning"]')).toBeNull();
  });

  it("shows the infinity marker rather than NaN when the distance is zero", async () => {
    await app.setFuelKm(0);

    const banner = app.q('[data-test="unprofitable-warning"]');
    expect(banner).not.toBeNull();
    expect(banner.textContent).toContain("∞");
    expect(banner.textContent).not.toContain("NaN");
  });

  it("blanks the unreachable figures in the table instead of printing negatives", async () => {
    await app.setEarningsPerKm(0.1);

    const [row] = app.rows();
    // Required KM/day, gross/day and gross/month are all unreachable.
    expect(row[3]).toBe("—");
    expect(row[4]).toBe("—");
    expect(row[5]).toBe("—");
    expect(app.text()).not.toContain("NaN");
  });
});

describe("results table sorting", () => {
  it("sorts by net target ascending on first click of that header", async () => {
    await app.click(app.chipByText(NET_TARGET, "4,000"));

    const header = app.qa("th").find((el) => el.textContent.includes("Net Target"));
    await app.click(header);

    const targets = app.rows().map((cells) => cells[1]);
    expect(targets[0]).toBe("RM 3500.00");
  });

  it("reverses the order when the same header is clicked twice", async () => {
    await app.click(app.chipByText(NET_TARGET, "4,000"));

    const header = app.qa("th").find((el) => el.textContent.includes("Net Target"));
    await app.click(header);
    await app.click(header);

    const targets = app.rows().map((cells) => cells[1]);
    expect(targets[0]).toBe("RM 4000.00");
  });

  it("resets to ascending when a different header is chosen", async () => {
    await app.click(app.chipByText(WORKING_DAYS, "24"));

    const netHeader = app.qa("th").find((el) => el.textContent.includes("Net Target"));
    const daysHeader = app.qa("th").find((el) => el.textContent.includes("Working Days"));

    await app.click(daysHeader);
    await app.click(daysHeader); // now descending on days
    await app.click(netHeader); // switching key must go back to ascending

    const days = app.rows().map((cells) => cells[0]);
    expect(Number(days[0])).toBeLessThanOrEqual(Number(days[days.length - 1]));
  });
});

describe("row count badge", () => {
  it("uses the singular form for one row", () => {
    expect(app.text()).toContain("1 row");
    expect(app.text()).not.toContain("1 rows");
  });

  it("uses the plural form for several rows", async () => {
    await app.click(app.chipByText(NET_TARGET, "4,000"));

    expect(app.text()).toContain("2 rows");
  });

  it("hides the badge entirely when there are no rows", async () => {
    await app.click(app.chipByText(WORKING_DAYS, "20"));

    expect(app.text()).not.toMatch(/\d+ rows?/);
  });
});

describe("export to PDF", () => {
  it("renders the export button", () => {
    expect(app.buttonByText("Export to PDF")).toBeTruthy();
  });

  it("builds a document and saves it under the expected filename", async () => {
    await app.click(app.buttonByText("Export to PDF"));

    expect(app.pdf.jsPDF).toHaveBeenCalledTimes(1);
    expect(app.pdf.save).toHaveBeenCalledWith("financial_calculator.pdf");
  });

  it("exports the same rows the table is showing, in the same order", async () => {
    await app.click(app.chipByText(NET_TARGET, "4,000"));
    await app.click(app.buttonByText("Export to PDF"));

    const { body, head } = app.pdf.autoTable.mock.calls[0][0];
    expect(head[0]).toContain("Required KM/Day");
    expect(body).toHaveLength(2);
    expect(String(body[0][1])).toContain("3500");
    expect(String(body[1][1])).toContain("4000");
  });

  it("writes the em dash for unreachable figures rather than negative numbers", async () => {
    await app.setEarningsPerKm(0.1);
    await app.click(app.buttonByText("Export to PDF"));

    const { body } = app.pdf.autoTable.mock.calls[0][0];
    expect(body[0].slice(3)).toEqual(["—", "—", "—"]);
  });
});

describe("locale switch", () => {
  it("translates the interface into Malay", async () => {
    await app.setLocale("ms");

    expect(app.text()).toContain("Hari Bekerja");
    expect(app.text()).not.toContain("Working Days per Month");
  });

  it("translates the unprofitable banner too", async () => {
    await app.setEarningsPerKm(0.1);

    await app.setLocale("ms");

    expect(app.q('[data-test="unprofitable-warning"]').textContent).toContain(
      "Tidak menguntungkan"
    );
  });
});
