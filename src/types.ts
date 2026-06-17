export interface GraphPoint {
  id: 'A' | 'B';
  label: string;
  x: number; // mathematical x coordinate
  y: number; // mathematical y coordinate (always x^2)
  color: string;
  isInteger: boolean;
}

export interface LineDetails {
  slope: number;
  yIntercept: number;
  isVertical: boolean;
  isTangent: boolean;
  equation: string;
}
