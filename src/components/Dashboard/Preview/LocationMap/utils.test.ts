import { parseShape, getColorPalette, colorize, computeCentroid } from "./utils";
import { LatLngTuple } from 'leaflet';


describe('computeCentroid should calculate polygon center correctly', function () {
  it('Should return null for empty or undefined input', function () {
    expect(computeCentroid([])).toBeNull();
    expect(computeCentroid(null as unknown as LatLngTuple[])).toBeNull();
  });

  it('Should return the point itself for a single-point polygon', function () {
    const point: LatLngTuple = [48.8575, 2.3514];
    expect(computeCentroid([point])).toEqual(point);
  });

  it('Should return the midpoint for a two-point polygon', function () {
    const p1: LatLngTuple = [48.0, 2.0];
    const p2: LatLngTuple = [49.0, 3.0];
    const result = computeCentroid([p1, p2]);
    expect(result![0]).toBeCloseTo(48.5, 5);
    expect(result![1]).toBeCloseTo(2.5, 5);
  });

  it('Should calculate centroid of a triangle', function () {
    // Equilateral-ish triangle
    const triangle: LatLngTuple[] = [
      [0, 0],
      [3, 0],
      [1.5, 3]
    ];
    const result = computeCentroid(triangle);
    // Centroid of a triangle is the average of its vertices
    expect(result![0]).toBeCloseTo(1.5, 1);
    expect(result![1]).toBeCloseTo(1.0, 1);
  });

  it('Should calculate centroid of a square', function () {
    const square: LatLngTuple[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10]
    ];
    const result = computeCentroid(square);
    expect(result![0]).toBeCloseTo(5, 5);
    expect(result![1]).toBeCloseTo(5, 5);
  });

  it('Should handle irregular polygons', function () {
    // Real IRIS-like zone (simplified)
    const irisZone: LatLngTuple[] = [
      [48.85, 2.35],
      [48.86, 2.35],
      [48.86, 2.36],
      [48.85, 2.36]
    ];
    const result = computeCentroid(irisZone);
    expect(result![0]).toBeCloseTo(48.855, 3);
    expect(result![1]).toBeCloseTo(2.355, 3);
  });
});

describe('Shape parser should work.', function () {    
  it('Should return null on bad expression', function () {
      expect(parseShape('POLYLOT((2.3514 48.8575, 2.3514 48.8575, 2.3514 48.8575))')).toBeNull()
      expect(parseShape('POLYGON(2.3514 48.8575, 2.3514 48.8575, 2.3514 48.8575))')).toBeNull()
      expect(parseShape('POLYGON(2.3514 48.8575 2.3514 48.8575, 2.3514 48.8575))')).toBeNull()
  });

  it('Should return null on bad expression', function () {
    const expression = parseShape('POLYGON((2.3514 48.8575, 2.3514 48.8575, 2.3514 48.8575))');
    const result = [[48.8575, 2.3514], [48.8575, 2.3514], [48.8575, 2.3514]]
    expect(expression).toEqual(result);
  });
});