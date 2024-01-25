import assert from "assert";
import { parseFilter, extractFilterParams } from ".";
import { ExpressionContext } from "./lib/FilterLanguageParser";

describe('Expresssion Parser should work.', function () {    
  it('Should return null on bad expression', function () {
      const result: ExpressionContext | null = null
      const expression = parseFilter('["key1": "value1", "test2"]');
      expect(expression).toBeNull()
      expect(expression).toEqual(result);
  });

  it('Should parse simple expression', function () {
    const expression = parseFilter('item.linkId eq F_MATER_001101');
    assert(expression != null)
    expect(expression.logicalExpression()).toBeNull()
    expect(expression.baseExpression().baseFilter().paramExp().CompareOp().getText()).toEqual("eq")
    expect(expression.baseExpression().baseFilter().paramExp().compValue().getText()).toEqual("F_MATER_001101")
  });

  it('Should parse good expressions', function () {
    const expression = parseFilter('item.linkId eq F_MATER_001101 and (item.answer.valueInteger lt 28 or item.answer.valueInteger gt 26)');
    assert(expression != null)
    expect(expression.baseExpression()).toBeNull()
  });

  it('Should return undefined on bad filter', function () {
    const params = extractFilterParams('item.linkId eq eq F_MATER_001101 and (item.answer.valueToken eq "https://aphp.fr/termino|code" or item.answer.valueString eq "some special string with strange chars $%!")');
    expect(params).toBeUndefined()
  });

  it('Should extract all params with multiple values', function () {
    const params = extractFilterParams('item.linkId eq F_MATER_001101 and (item.answer.valueInteger lt 28 or item.answer.valueInteger gt 26)');
    assert(params !== undefined)
    expect(params).toEqual([
      {
        param: 'item.linkId',
        values: [{
          operator: 'eq',
          value: 'F_MATER_001101'
        }]
      },
      {
        param: 'item.answer.valueInteger',
        values: [
          {
            operator: 'lt',
            value: '28'
          },
          {
            operator: 'gt',
            value: '26'
          }
        ]
      }
    ])
  });

  it('Should extract all special params', function () {
    const params = extractFilterParams('item.linkId eq F_MATER_001101 and (item.answer.valueString eq "" or item.answer.valueToken eq " https://aphp.fr/termino|code" or item.answer.valueString eq "some special string with strange chars $%!")');
    assert(params !== undefined)
    expect(params).toEqual([
      {
        param: 'item.linkId',
        values: [{
          operator: 'eq',
          value: 'F_MATER_001101'
        }]
      },
      {
        param: 'item.answer.valueString',
        values: [
          {
            operator: 'eq',
            value: ''
          },
          {
            operator: 'eq',
            value: 'some special string with strange chars $%!'
          }
        ]
      },
      {
        param: 'item.answer.valueToken',
        values: [{
          operator: 'eq',
          value: 'https://aphp.fr/termino|code'
        }]
      }])
  });

  it('Should omit "eq" operator when asked for', function () {
    const params = extractFilterParams('item.linkId eq F_MATER_001101', {omitOperatorEq: true});
    assert(params !== undefined)
    expect(params).toEqual([
      {
        param: 'item.linkId',
        values: [{
          value: 'F_MATER_001101'
        }]
      }
    ])
  });
  


});