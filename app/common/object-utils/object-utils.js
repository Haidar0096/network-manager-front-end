"use strict";

/**
 * Returns true if the given value is a number (number string will return false with this method).
 */
export const isNumber = (n) => Number.isFinite(n);

/**
 * Returns true if the given value is a number or number string.
 */
export const isNumberOrNumberString = (n) => !isNaN(parseFloat(n)) && !isNaN(n - 0);
