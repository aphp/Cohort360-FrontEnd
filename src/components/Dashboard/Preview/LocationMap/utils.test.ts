import { parseShape, getColorPalette, colorize } from "./utils";


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
    // Note: count of 0 results in colorIndex of -1 which returns undefined (expected behavior - no zones with 0 patients)
    expect(colorize(['#single'], 5, 10)).toBe('#single');
    // Very small counts should still get first color
    expect(colorize(palette, 1, 30)).toBe('#low');
  });
});