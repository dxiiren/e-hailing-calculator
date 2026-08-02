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

describe("computeRequirement — unprofitability guard", () => {
  // The documented bug: with no guard, cost/km >= earnings/km made requiredKM
  // go negative (or Infinity at exact break-even). The result must instead be
  // flagged unprofitable, with no misleading numbers.
  it("flags unprofitable when fuel cost per km >= earnings per km", () => {
    // Strictly worse: cost RM0.15/km, earning only RM0.10/km.
    const losing = computeRequirement({
      income: 3500,
      days: 20,
      fuelCost: 60,
      fuelKm: 400,
      earningsPerKm: 0.1,
    });
    expect(losing.unprofitable).toBe(true);
    expect(losing.requiredKM).toBeNull();
    expect(losing.grossPerDay).toBeNull();
    expect(losing.grossPerMonth).toBeNull();

    // Exact break-even: cost RM0.15/km == earnings RM0.15/km.
    const breakEven = computeRequirement({
      income: 3500,
      days: 20,
      fuelCost: 60,
      fuelKm: 400,
      earningsPerKm: 0.15,
    });
    expect(breakEven.unprofitable).toBe(true);
    expect(breakEven.requiredKM).toBeNull();
  });

  it("does not flag the profitable default inputs", () => {
    const r = computeRequirement({ income: 3500, days: 20, ...defaults });
    expect(r.unprofitable).toBe(false);
    expect(r.requiredKM).toBe(319);
  });

  it("flags zero/invalid efficiency inputs as unprofitable, not NaN", () => {
    // fuelKm 0 -> cost per km is Infinite: driving cannot pay for itself.
    const noRange = computeRequirement({
      income: 3500,
      days: 20,
      fuelCost: 60,
      fuelKm: 0,
      earningsPerKm: 0.7,
    });
    expect(noRange.unprofitable).toBe(true);
    expect(noRange.requiredKM).toBeNull();

    // earningsPerKm 0 with a real fuel cost: pure loss.
    const noEarnings = computeRequirement({
      income: 3500,
      days: 20,
      fuelCost: 60,
      fuelKm: 400,
      earningsPerKm: 0,
    });
    expect(noEarnings.unprofitable).toBe(true);
    expect(noEarnings.requiredKM).toBeNull();
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
