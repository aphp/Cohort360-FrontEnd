// Generated from FilterLanguage.g4 by ANTLR 4.13.1

import { ParseTreeListener } from 'antlr4'

import { ExpressionContext } from './FilterLanguageParser'
import { LogicalExpressionContext } from './FilterLanguageParser'
import { BaseExpressionContext } from './FilterLanguageParser'
import { NotExpressionContext } from './FilterLanguageParser'
import { BaseFilterContext } from './FilterLanguageParser'
import { GroupExpressionContext } from './FilterLanguageParser'
import { ParamExpContext } from './FilterLanguageParser'
import { CompValueContext } from './FilterLanguageParser'
import { ParamValueContext } from './FilterLanguageParser'
import { HasSpecifierContext } from './FilterLanguageParser'
import { ResourceContext } from './FilterLanguageParser'
import { IndexContext } from './FilterLanguageParser'
import { ParamPathContext } from './FilterLanguageParser'
import { TokenContext } from './FilterLanguageParser'

/**
 * This interface defines a complete listener for a parse tree produced by
 * `FilterLanguageParser`.
 */
export default class FilterLanguageListener extends ParseTreeListener {
  /**
   * Enter a parse tree produced by `FilterLanguageParser.expression`.
   * @param ctx the parse tree
   */
  enterExpression?: (ctx: ExpressionContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.expression`.
   * @param ctx the parse tree
   */
  exitExpression?: (ctx: ExpressionContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.logicalExpression`.
   * @param ctx the parse tree
   */
  enterLogicalExpression?: (ctx: LogicalExpressionContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.logicalExpression`.
   * @param ctx the parse tree
   */
  exitLogicalExpression?: (ctx: LogicalExpressionContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.baseExpression`.
   * @param ctx the parse tree
   */
  enterBaseExpression?: (ctx: BaseExpressionContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.baseExpression`.
   * @param ctx the parse tree
   */
  exitBaseExpression?: (ctx: BaseExpressionContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.notExpression`.
   * @param ctx the parse tree
   */
  enterNotExpression?: (ctx: NotExpressionContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.notExpression`.
   * @param ctx the parse tree
   */
  exitNotExpression?: (ctx: NotExpressionContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.baseFilter`.
   * @param ctx the parse tree
   */
  enterBaseFilter?: (ctx: BaseFilterContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.baseFilter`.
   * @param ctx the parse tree
   */
  exitBaseFilter?: (ctx: BaseFilterContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.groupExpression`.
   * @param ctx the parse tree
   */
  enterGroupExpression?: (ctx: GroupExpressionContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.groupExpression`.
   * @param ctx the parse tree
   */
  exitGroupExpression?: (ctx: GroupExpressionContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.paramExp`.
   * @param ctx the parse tree
   */
  enterParamExp?: (ctx: ParamExpContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.paramExp`.
   * @param ctx the parse tree
   */
  exitParamExp?: (ctx: ParamExpContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.compValue`.
   * @param ctx the parse tree
   */
  enterCompValue?: (ctx: CompValueContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.compValue`.
   * @param ctx the parse tree
   */
  exitCompValue?: (ctx: CompValueContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.paramValue`.
   * @param ctx the parse tree
   */
  enterParamValue?: (ctx: ParamValueContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.paramValue`.
   * @param ctx the parse tree
   */
  exitParamValue?: (ctx: ParamValueContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.hasSpecifier`.
   * @param ctx the parse tree
   */
  enterHasSpecifier?: (ctx: HasSpecifierContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.hasSpecifier`.
   * @param ctx the parse tree
   */
  exitHasSpecifier?: (ctx: HasSpecifierContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.resource`.
   * @param ctx the parse tree
   */
  enterResource?: (ctx: ResourceContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.resource`.
   * @param ctx the parse tree
   */
  exitResource?: (ctx: ResourceContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.index`.
   * @param ctx the parse tree
   */
  enterIndex?: (ctx: IndexContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.index`.
   * @param ctx the parse tree
   */
  exitIndex?: (ctx: IndexContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.paramPath`.
   * @param ctx the parse tree
   */
  enterParamPath?: (ctx: ParamPathContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.paramPath`.
   * @param ctx the parse tree
   */
  exitParamPath?: (ctx: ParamPathContext) => void
  /**
   * Enter a parse tree produced by `FilterLanguageParser.token`.
   * @param ctx the parse tree
   */
  enterToken?: (ctx: TokenContext) => void
  /**
   * Exit a parse tree produced by `FilterLanguageParser.token`.
   * @param ctx the parse tree
   */
  exitToken?: (ctx: TokenContext) => void
}
