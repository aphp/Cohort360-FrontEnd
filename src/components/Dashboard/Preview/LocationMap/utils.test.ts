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
    const p1: LatLngTuple = [48, 2];
    const p2: LatLngTuple = [49, 3];
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
    expect(result![1]).toBeCloseTo(1, 1);
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

describe('parseShape', function () {
  it('Should return null on bad expression', function () {
      expect(parseShape('POLYLOT((2.3514 48.8575, 2.3514 48.8575, 2.3514 48.8575))')).toBeNull()
      expect(parseShape('POLYGON(2.3514 48.8575, 2.3514 48.8575, 2.3514 48.8575))')).toBeNull()
      expect(parseShape('POLYGON(2.3514 48.8575 2.3514 48.8575, 2.3514 48.8575))')).toBeNull()
  });

  it('Should parse valid polygon expression', function () {
    const expression = parseShape('POLYGON((2.3514 48.8575, 2.3514 48.8575, 2.3514 48.8575))');
    const result = [[48.8575, 2.3514], [48.8575, 2.3514], [48.8575, 2.3514]]
    expect(expression).toEqual(result);
  });

  it('Should return null for undefined or empty input', function () {
    expect(parseShape(undefined)).toBeNull();
    expect(parseShape('')).toBeNull();
  });

  it('Should return only the first polygon from pipe-separated multipolygon', function () {
    const multi = 'POLYGON((2.0 48.0, 2.1 48.1, 2.0 48.0))|POLYGON((3.0 49.0, 3.1 49.1, 3.0 49.0))';
    expect(parseShape(multi)).toEqual([[48.0, 2.0], [48.1, 2.1], [48.0, 2.0]]);
  });
});

describe('getColorPalette', function () {
  const palette = ['#a', '#b', '#c', '#d', '#e', '#f', '#g', '#h', '#i', '#j'];

  it('Should return full palette when maxCount >= palette length', function () {
    expect(getColorPalette(palette, 10)).toEqual(palette);
    expect(getColorPalette(palette, 20)).toEqual(palette);
  });

  it('Should return first and last colors when maxCount is 2', function () {
    expect(getColorPalette(palette, 2)).toEqual(['#a', '#j']);
  });

  it('Should return a subset starting from the first color when maxCount < palette length', function () {
    const result = getColorPalette(palette, 5);
    // inc = floor(10/5) = 2, picks indices 0, 2, 4, 6, 8
    expect(result).toEqual(['#a', '#c', '#e', '#g', '#i']);
  });

  it('Should return single-element palette unchanged', function () {
    expect(getColorPalette(['#only'], 5)).toEqual(['#only']);
  });
});

describe('colorize', function () {
  const palette = ['#low', '#mid', '#high'];
  // step = 30 / 3 = 10, so: [0..10) → #low, [10..20) → #mid, [20..30+) → #high

  it('Should map count to the correct color bucket', function () {
    expect(colorize(palette, 1, 30)).toBe('#low');
    expect(colorize(palette, 9, 30)).toBe('#low');
    expect(colorize(palette, 11, 30)).toBe('#mid');
    expect(colorize(palette, 21, 30)).toBe('#high');
  });

  it('Should clamp to last color when count >= maxCount', function () {
    expect(colorize(palette, 30, 30)).toBe('#high');
    expect(colorize(palette, 100, 30)).toBe('#high');
  });

  it('Should return undefined for count=0 (palette[-1])', function () {
    // floor((0 - 0.1) / 10) = -1 → palette[-1] is undefined in JS
    expect(colorize(palette, 0, 30)).toBeUndefined();
  });
});
