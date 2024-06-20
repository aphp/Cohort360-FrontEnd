import { parseShape } from "./utils";


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