/**
 * @fileoverview D3.js utility functions for chart rendering
 * @module utils/d3_helper
 */

/**
 * Calculates optimal tick count and spacing for D3.js charts based on the maximum tick value
 *
 * Function adapted from http://bl.ocks.org/tanykim/62462c396b37874ebd87
 * Takes into account the maxTick value to determine the tick count to have a great tick repartition
 *
 * @param {number} maxTick - The maximum tick value for the chart
 * @returns {{endPoint: number, count: number}} Object containing endPoint and tick count
 *
 * @example
 * ```javascript
 * getOptimalTicksCount(1000)
 * // returns { endPoint: 1000, count: 10 }
 *
 * getOptimalTicksCount(7)
 * // returns { endPoint: 10, count: 7 }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getOptimalTicksCount = (maxTick) => {
  // base step between nearby two ticks
  let step = Math.pow(10, maxTick.toString().length - 1)

  // modify steps either: 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000...
  if (maxTick / step < 2) {
    step = step / 5
  } else if (maxTick / step < 5) {
    step = step / 2
  }
  step = step < 1 ? 1 : step

  // add one more step if the last tick value is the same as the max value
  // if you don't want to add, remove "+1"
  const slicesCount = Math.ceil((maxTick + 1) / step)

  return {
    endPoint: slicesCount * step,
    count: Math.min(10, Math.min(slicesCount, maxTick)) // show max 10 ticks
  }
}
