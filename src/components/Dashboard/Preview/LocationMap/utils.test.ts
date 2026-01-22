import { parseShape, getColorPalette, colorize } from "./utils";


describe('Shape parser should work.', function () {    
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

  it('Should parse multipolygon (pipe-separated) and return first polygon', function () {
    const multi = 'POLYGON((2.0 48.0, 2.1 48.1, 2.0 48.0))|POLYGON((3.0 49.0, 3.1 49.1, 3.0 49.0))';
    const result = parseShape(multi);
    // Should return first polygon only
    expect(result).toEqual([[48.0, 2.0], [48.1, 2.1], [48.0, 2.0]]);
  });
});

describe('getColorPalette should return appropriate color subsets', function () {
  const fullPalette = ['#ff0000', '#ff4000', '#ff8000', '#ffc000', '#ffff00', '#c0ff00', '#80ff00', '#40ff00', '#00ff00', '#00ff40'];

  it('Should return full palette when maxCount >= palette length', function () {
    expect(getColorPalette(fullPalette, 10)).toEqual(fullPalette);
    expect(getColorPalette(fullPalette, 15)).toEqual(fullPalette);
  });

  it('Should return first and last colors when maxCount is 2', function () {
    const result = getColorPalette(fullPalette, 2);
    expect(result).toEqual(['#ff0000', '#00ff40']);
  });

  it('Should return a subset when maxCount is less than palette length', function () {
    const result = getColorPalette(fullPalette, 5);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result[0]).toBe('#ff0000'); // First color is always included
  });
});

describe('colorize should map counts to colors correctly', function () {
  const palette = ['#low', '#medium', '#high'];

  it('Should return first color for low counts', function () {
    expect(colorize(palette, 1, 30)).toBe('#low');
  });

  it('Should return last color for counts at or above maxCount', function () {
    expect(colorize(palette, 30, 30)).toBe('#high');
    expect(colorize(palette, 100, 30)).toBe('#high');
  });

  it('Should handle edge cases', function () {
    expect(colorize(['#single'], 5, 10)).toBe('#single');
    // Very small counts should still get first color
    expect(colorize(palette, 1, 30)).toBe('#low');
  });

  it('Should return undefined for count=0 (zones with 0 patients should not exist)', function () {
    // count of 0 results in colorIndex of -1 which returns undefined
    // This is expected behavior - zones with 0 patients should never be rendered
    expect(colorize(palette, 0, 30)).toBeUndefined();
  });

  it('Should distribute colors proportionally across count range', function () {
    // With 3 colors and maxCount=30, each color covers ~10 units
    expect(colorize(palette, 5, 30)).toBe('#low');     // 0-10 range
    expect(colorize(palette, 15, 30)).toBe('#medium'); // 10-20 range
    expect(colorize(palette, 25, 30)).toBe('#high');   // 20-30 range
  });
});

describe('getColorPalette edge cases', function () {
  const fullPalette = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10'];

  it('Should handle maxCount of 1', function () {
    const result = getColorPalette(fullPalette, 1);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toBe('#1');
  });

  it('Should handle maxCount of 0', function () {
    const result = getColorPalette(fullPalette, 0);
    // When maxCount < palette length and not 2, returns subset starting with first color
    expect(result[0]).toBe('#1');
  });

  it('Should handle single-color palette', function () {
    const result = getColorPalette(['#only'], 5);
    expect(result).toEqual(['#only']);
  });
});