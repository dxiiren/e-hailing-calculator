import { describe, it, expect } from "vitest";
import {
  computeCostPerKm,
  computeRequirement,
  computeCombinations,
} from "../lib/calc.js";

// The app's shipped defaults: RM 60 of fuel covers 400 km, earning RM 0.70/km.
const defaults = { fuelCost: 60, fuelKm: 400, earningsPerKm: 0.7 };

describe("computeCostPerKm", () => {
  it("divides fuel spend by distance covered", () => {
    expect(computeCostPerKm({ fuelCost: 60, fuelKm: 400 })).toBeCloseTo(0.15, 10);
  });
});

describe("computeRequirement — regression pins (old in-component math)", () => {
  // These pin the exact numbers the pre-extraction app.js produced for the
  // default profitable inputs. If they break, the refactor changed behavior.
  it("RM3500 over 20 days at defaults -> 319 km/day, RM223.30 gross/day", () => {
    const r = computeRequirement({ income: 3500, days: 20, ...defaults });
    expect(r.netPerDay).toBeCloseTo(175, 10); // 3500 / 20
    expect(r.requiredKM).toBe(319); // ceil(175 / (0.70 - 0.15))
    expect(r.grossPerDay).toBeCloseTo(223.3, 8); // 319 * 0.70
    expect(r.grossPerMonth).toBeCloseTo(4466, 8); // 223.30 * 20
  });

  it("RM4000 over 24 days at defaults -> 304 km/day, RM212.80 gross/day", () => {
    const r = computeRequirement({ income: 4000, days: 24, ...defaults });
    expect(r.netPerDay).toBeCloseTo(4000 / 24, 10);
    expect(r.requiredKM).toBe(304); // ceil(166.67 / 0.55)
    expect(r.grossPerDay).toBeCloseTo(212.8, 8);
    expect(r.grossPerMonth).toBeCloseTo(5107.2, 8);
  });
});

describe("computeCombinations", () => {
  it("crosses every income with every days value", () => {
    const rows = computeCombinations({
      incomes: [3500, 4000],
      daysList: [20, 24],
      ...defaults,
    });
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => [r.income, r.days])).toEqual([
      [3500, 20],
      [3500, 24],
      [4000, 20],
      [4000, 24],
    ]);
  });

  it("skips falsy incomes and days (unfilled custom inputs)", () => {
    const rows = computeCombinations({
      incomes: [3500, null, 0],
      daysList: [20, undefined],
      ...defaults,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].income).toBe(3500);
    expect(rows[0].days).toBe(20);
  });

  it("returns no rows while fuel cost is 0/unset (original guard)", () => {
    const rows = computeCombinations({
      incomes: [3500],
      daysList: [20],
      fuelCost: 0,
      fuelKm: 400,
      earningsPerKm: 0.7,
    });
    expect(rows).toEqual([]);
  });
});
