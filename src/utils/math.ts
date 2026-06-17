import { LineDetails } from '../types';

/**
 * Checks if a number is virtually an integer within a small tolerance.
 */
export function isNearInteger(val: number, tolerance = 0.001): boolean {
  return Math.abs(val - Math.round(val)) < tolerance;
}

/**
 * Gets the closest integer.
 */
export function getNearestInteger(val: number): number {
  return Math.round(val);
}

/**
 * General line computations for y = x^2 given two x coordinates.
 * Handles the tangent fallback when x1 ≈ x2.
 */
export function calculateLineDetails(x1: number, x2: number): LineDetails {
  const y1 = x1 * x1;
  const y2 = x2 * x2;

  // Check if they are virtually the same point (tangent case)
  const isTangent = Math.abs(x1 - x2) < 0.0001;

  let slope: number;
  let yIntercept: number;

  if (isTangent) {
    // Tangent to y = x^2 at x1: y' = 2x, so slope is 2 * x1
    slope = 2 * x1;
    // y - y1 = m(x - x1) => y = 2*x1*x - 2*x1^2 + x1^2 => y = 2*x1*x - x1^2
    yIntercept = -x1 * x1;
  } else {
    // For y = x^2, slope of secant line is algebraically (x1 + x2)
    slope = x1 + x2;
    // Y-intercept is algebraically -x1 * x2
    yIntercept = -x1 * x2;
  }

  // Format equation: y = mx + c
  const mStr = slope === 0 ? '' : `${slope.toFixed(2)}x`;
  const cSign = yIntercept >= 0 ? '+' : '-';
  const cValStr = Math.abs(yIntercept).toFixed(2);
  let equation = '';

  if (slope === 0) {
    equation = `y = ${yIntercept.toFixed(2)}`;
  } else {
    equation = `y = ${slope.toFixed(2)}x ${cSign} ${cValStr}`;
  }

  return {
    slope,
    yIntercept,
    isVertical: false,
    isTangent,
    equation
  };
}
