// Generated from FilterLanguage.g4 by ANTLR 4.13.1

import { ParseTreeVisitor } from 'antlr4'

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
 * This interface defines a complete generic visitor for a parse tree produced
 * by `FilterLanguageParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class FilterLanguageVisitor<Result> extends ParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `FilterLanguageParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression?: (ctx: ExpressionContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.logicalExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLogicalExpression?: (ctx: LogicalExpressionContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.baseExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBaseExpression?: (ctx: BaseExpressionContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.notExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitNotExpression?: (ctx: NotExpressionContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.baseFilter`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBaseFilter?: (ctx: BaseFilterContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.groupExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitGroupExpression?: (ctx: GroupExpressionContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.paramExp`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParamExp?: (ctx: ParamExpContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.compValue`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitCompValue?: (ctx: CompValueContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.paramValue`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParamValue?: (ctx: ParamValueContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.hasSpecifier`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitHasSpecifier?: (ctx: HasSpecifierContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.resource`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitResource?: (ctx: ResourceContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.index`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitIndex?: (ctx: IndexContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.paramPath`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParamPath?: (ctx: ParamPathContext) => Result
  /**
   * Visit a parse tree produced by `FilterLanguageParser.token`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitToken?: (ctx: TokenContext) => Result
}
