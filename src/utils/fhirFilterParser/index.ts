import { CharStreams, CommonTokenStream } from 'antlr4'
import FilterLanguageLexer from './lib/FilterLanguageLexer'
import FilterLanguageParser, { ExpressionContext, ParamExpContext } from './lib/FilterLanguageParser'
import FilterLanguageVisitor from './lib/FilterLanguageVisitor'
import { getConfig } from 'config'

export type FhirFilterValue = {
  operator?: string
  value: string
}

export type FhirFilter = {
  param: string
  values: Array<FhirFilterValue>
}

export type ExtractionOptions = {
  omitOperatorEq: boolean
}

class ParamExtractionVisitor extends FilterLanguageVisitor<void> {
  options: ExtractionOptions
  params: Array<FhirFilter>

  constructor(options?: ExtractionOptions) {
    super()
    this.params = []
    this.options = options || { omitOperatorEq: false }
  }

  visitParamExp: (ctx: ParamExpContext) => void = (ctx: ParamExpContext) => {
    const paramKey = ctx.paramValue().getText()
    const compareOp = ctx.CompareOp().getText()
    // remove double quotes when it matches the String rule
    const value =
      ctx.compValue().String() != null
        ? ctx
            .compValue()
            .String()
            .getText()
            .substring(1, ctx.compValue().String().getText().length - 1)
            .trim()
        : ctx.compValue().getText()
    const newParamValue = {
      operator: compareOp === 'eq' && this.options.omitOperatorEq ? undefined : compareOp,
      value
    }
    const existingParam = this.params.find((param) => param.param === paramKey)
    if (existingParam) {
      // if the param is already in the list, we need to check if it's not already a multiple value
      // in that case we extract the value and initialize the values array
      existingParam.values?.push(newParamValue)
    } else {
      this.params.push({
        param: paramKey,
        values: [newParamValue]
      })
    }
  }
}

export const parseFilter = (filterStr: string): ExpressionContext | null => {
  // Give the lexer our input as a stream of characters
  const charStream = CharStreams.fromString(filterStr)
  const lexer = new FilterLanguageLexer(charStream)

  // Create a stream of tokens and give it to the parser
  const tokenStream = new CommonTokenStream(lexer)
  const parser = new FilterLanguageParser(tokenStream)

  const ruleContext = parser.expression()

  if (ruleContext.exception) {
    console.error(ruleContext.exception)
    return null
  }

  return ruleContext
}

export const extractParams = (expression: ExpressionContext, options?: ExtractionOptions): Array<FhirFilter> => {
  const visitor = new ParamExtractionVisitor(options)
  visitor.visit(expression)
  return visitor.params
}

export const extractFilterParams = (filterStr: string, options?: ExtractionOptions): Array<FhirFilter> | undefined => {
  const expression = parseFilter(filterStr)
  if (expression) {
    return extractParams(expression, options)
  }
  return undefined
}

export const isIdentifyingFilter = (filterStr: string): boolean => {
  // need to load appConfig
  const identifyingFields = getConfig().features.cohort.identifyingFields
  const criteria = filterStr.split('&')
  for (const c of criteria) {
    const key = c.split('=')[0]
    if (identifyingFields.includes(key)) {
      return true
    }
  }
  return false
}

export default extractFilterParams
