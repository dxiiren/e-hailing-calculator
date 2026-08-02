// Pure calculator math for the E-Hailing Financial Calculator.
// ES module, no dependencies — imported by app.js (browser) and the Vitest suite (node).

/**
 * Fuel cost per kilometre. RM spent on a tank divided by the km that tank covers.
 */
export function computeCostPerKm({ fuelCost, fuelKm }) {
  return fuelCost / fuelKm;
}

/**
 * One income x days combination: how far must the driver go each day, and what
 * gross earnings does that imply?
 *
 * @param {object} input
 * @param {number} input.income        monthly net-income target (RM)
 * @param {number} input.days          working days per month
 * @param {number} input.fuelCost      usual fuel spend (RM)
 * @param {number} input.fuelKm        distance that fuel covers (KM)
 * @param {number} input.earningsPerKm earnings per kilometre (RM)
 */
export function computeRequirement({ income, days, fuelCost, fuelKm, earningsPerKm }) {
  const costPerKm = computeCostPerKm({ fuelCost, fuelKm });
  const netPerDay = income / days;
  const netPerKm = earningsPerKm - costPerKm;
  const requiredKM = Math.ceil(netPerDay / netPerKm);
  const grossPerDay = requiredKM * earningsPerKm;
  const grossPerMonth = grossPerDay * days;
  return {
    income,
    days,
    netPerDay,
    requiredKM,
    grossPerDay,
    grossPerMonth,
  };
}

/**
 * Cross product of every net-income target with every working-day count.
 * Skips combos with falsy income/days and skips everything when costPerKm is
 * falsy (fuelCost 0 or unset) — mirrors the original in-component guard.
 */
export function computeCombinations({ incomes, daysList, fuelCost, fuelKm, earningsPerKm }) {
  const costPerKm = computeCostPerKm({ fuelCost, fuelKm });
  const results = [];
  for (const income of incomes) {
    for (const days of daysList) {
      if (income && days && costPerKm) {
        results.push(computeRequirement({ income, days, fuelCost, fuelKm, earningsPerKm }));
      }
    }
  }
  return results;
}
