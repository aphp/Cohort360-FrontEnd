// Generated from FilterLanguage.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
  ATN,
  ATNDeserializer,
  DecisionState,
  DFA,
  FailedPredicateException,
  RecognitionException,
  NoViableAltException,
  Parser,
  ParserATNSimulator,
  ParserRuleContext,
  PredictionContextCache,
  TerminalNode,
  Token,
  TokenStream
} from 'antlr4'
import FilterLanguageListener from './FilterLanguageListener'
import FilterLanguageVisitor from './FilterLanguageVisitor'

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type int = number

export default class FilterLanguageParser extends Parser {
  public static readonly T__0 = 1
  public static readonly T__1 = 2
  public static readonly T__2 = 3
  public static readonly T__3 = 4
  public static readonly T__4 = 5
  public static readonly T__5 = 6
  public static readonly T__6 = 7
  public static readonly T__7 = 8
  public static readonly SP = 9
  public static readonly NumberOrDate = 10
  public static readonly String = 11
  public static readonly CompareOp = 12
  public static readonly PARAM_NAME = 13
  public static readonly NameChar = 14
  public static readonly NameCharStart = 15
  public static readonly JSON_STRING = 16
  public static readonly TOKEN = 17
  public static readonly LPAR = 18
  public static readonly RPAR = 19
  public static readonly NUMBER = 20
  public static readonly ALPHA = 21
  public static readonly EOF = Token.EOF
  public static readonly RULE_expression = 0
  public static readonly RULE_logicalExpression = 1
  public static readonly RULE_baseExpression = 2
  public static readonly RULE_notExpression = 3
  public static readonly RULE_baseFilter = 4
  public static readonly RULE_groupExpression = 5
  public static readonly RULE_paramExp = 6
  public static readonly RULE_compValue = 7
  public static readonly RULE_paramValue = 8
  public static readonly RULE_hasSpecifier = 9
  public static readonly RULE_resource = 10
  public static readonly RULE_index = 11
  public static readonly RULE_paramPath = 12
  public static readonly RULE_token = 13
  public static readonly literalNames: (string | null)[] = [
    null,
    "'and'",
    "'or'",
    "'not'",
    "'_has:'",
    "':'",
    "'['",
    "']'",
    "'.'",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "'('",
    "')'"
  ]
  public static readonly symbolicNames: (string | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'SP',
    'NumberOrDate',
    'String',
    'CompareOp',
    'PARAM_NAME',
    'NameChar',
    'NameCharStart',
    'JSON_STRING',
    'TOKEN',
    'LPAR',
    'RPAR',
    'NUMBER',
    'ALPHA'
  ]
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    'expression',
    'logicalExpression',
    'baseExpression',
    'notExpression',
    'baseFilter',
    'groupExpression',
    'paramExp',
    'compValue',
    'paramValue',
    'hasSpecifier',
    'resource',
    'index',
    'paramPath',
    'token'
  ]
  public get grammarFileName(): string {
    return 'FilterLanguage.g4'
  }
  public get literalNames(): (string | null)[] {
    return FilterLanguageParser.literalNames
  }
  public get symbolicNames(): (string | null)[] {
    return FilterLanguageParser.symbolicNames
  }
  public get ruleNames(): string[] {
    return FilterLanguageParser.ruleNames
  }
  public get serializedATN(): number[] {
    return FilterLanguageParser._serializedATN
  }

  protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message)
  }

  constructor(input: TokenStream) {
    super(input)
    this._interp = new ParserATNSimulator(
      this,
      FilterLanguageParser._ATN,
      FilterLanguageParser.DecisionsToDFA,
      new PredictionContextCache()
    )
  }
  // @RuleVersion(0)
  public expression(): ExpressionContext {
    const localctx: ExpressionContext = new ExpressionContext(this, this._ctx, this.state)
    this.enterRule(localctx, 0, FilterLanguageParser.RULE_expression)
    try {
      this.state = 30
      this._errHandler.sync(this)
      switch (this._interp.adaptivePredict(this._input, 0, this._ctx)) {
        case 1:
          this.enterOuterAlt(localctx, 1)
          {
            this.state = 28
            this.baseExpression()
          }
          break
        case 2:
          this.enterOuterAlt(localctx, 2)
          {
            this.state = 29
            this.logicalExpression()
          }
          break
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public logicalExpression(): LogicalExpressionContext {
    const localctx: LogicalExpressionContext = new LogicalExpressionContext(this, this._ctx, this.state)
    this.enterRule(localctx, 2, FilterLanguageParser.RULE_logicalExpression)
    let _la: number
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 32
        this.baseExpression()
        this.state = 35
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        do {
          {
            {
              this.state = 33
              _la = this._input.LA(1)
              if (!(_la === 1 || _la === 2)) {
                this._errHandler.recoverInline(this)
              } else {
                this._errHandler.reportMatch(this)
                this.consume()
              }
              this.state = 34
              this.baseExpression()
            }
          }
          this.state = 37
          this._errHandler.sync(this)
          _la = this._input.LA(1)
        } while (_la === 1 || _la === 2)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public baseExpression(): BaseExpressionContext {
    const localctx: BaseExpressionContext = new BaseExpressionContext(this, this._ctx, this.state)
    this.enterRule(localctx, 4, FilterLanguageParser.RULE_baseExpression)
    try {
      this.state = 41
      this._errHandler.sync(this)
      switch (this._input.LA(1)) {
        case 3:
          this.enterOuterAlt(localctx, 1)
          {
            this.state = 39
            this.notExpression()
          }
          break
        case 4:
        case 13:
        case 18:
          this.enterOuterAlt(localctx, 2)
          {
            this.state = 40
            this.baseFilter()
          }
          break
        default:
          throw new NoViableAltException(this)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public notExpression(): NotExpressionContext {
    const localctx: NotExpressionContext = new NotExpressionContext(this, this._ctx, this.state)
    this.enterRule(localctx, 6, FilterLanguageParser.RULE_notExpression)
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 43
        this.match(FilterLanguageParser.T__2)
        this.state = 44
        this.groupExpression()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public baseFilter(): BaseFilterContext {
    const localctx: BaseFilterContext = new BaseFilterContext(this, this._ctx, this.state)
    this.enterRule(localctx, 8, FilterLanguageParser.RULE_baseFilter)
    try {
      this.state = 48
      this._errHandler.sync(this)
      switch (this._input.LA(1)) {
        case 4:
        case 13:
          this.enterOuterAlt(localctx, 1)
          {
            this.state = 46
            this.paramExp()
          }
          break
        case 18:
          this.enterOuterAlt(localctx, 2)
          {
            this.state = 47
            this.groupExpression()
          }
          break
        default:
          throw new NoViableAltException(this)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public groupExpression(): GroupExpressionContext {
    const localctx: GroupExpressionContext = new GroupExpressionContext(this, this._ctx, this.state)
    this.enterRule(localctx, 10, FilterLanguageParser.RULE_groupExpression)
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 50
        this.match(FilterLanguageParser.LPAR)
        this.state = 51
        this.expression()
        this.state = 52
        this.match(FilterLanguageParser.RPAR)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public paramExp(): ParamExpContext {
    const localctx: ParamExpContext = new ParamExpContext(this, this._ctx, this.state)
    this.enterRule(localctx, 12, FilterLanguageParser.RULE_paramExp)
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 54
        this.paramValue()
        this.state = 55
        this.match(FilterLanguageParser.CompareOp)
        this.state = 56
        this.compValue()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public compValue(): CompValueContext {
    const localctx: CompValueContext = new CompValueContext(this, this._ctx, this.state)
    this.enterRule(localctx, 14, FilterLanguageParser.RULE_compValue)
    try {
      this.state = 61
      this._errHandler.sync(this)
      switch (this._input.LA(1)) {
        case 10:
          this.enterOuterAlt(localctx, 1)
          {
            this.state = 58
            this.match(FilterLanguageParser.NumberOrDate)
          }
          break
        case 11:
          this.enterOuterAlt(localctx, 2)
          {
            this.state = 59
            this.match(FilterLanguageParser.String)
          }
          break
        case 13:
        case 17:
          this.enterOuterAlt(localctx, 3)
          {
            this.state = 60
            this.token()
          }
          break
        default:
          throw new NoViableAltException(this)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public paramValue(): ParamValueContext {
    const localctx: ParamValueContext = new ParamValueContext(this, this._ctx, this.state)
    this.enterRule(localctx, 16, FilterLanguageParser.RULE_paramValue)
    try {
      this.state = 65
      this._errHandler.sync(this)
      switch (this._input.LA(1)) {
        case 4:
          this.enterOuterAlt(localctx, 1)
          {
            this.state = 63
            this.hasSpecifier()
          }
          break
        case 13:
          this.enterOuterAlt(localctx, 2)
          {
            this.state = 64
            this.paramPath()
          }
          break
        default:
          throw new NoViableAltException(this)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public hasSpecifier(): HasSpecifierContext {
    const localctx: HasSpecifierContext = new HasSpecifierContext(this, this._ctx, this.state)
    this.enterRule(localctx, 18, FilterLanguageParser.RULE_hasSpecifier)
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 67
        this.match(FilterLanguageParser.T__3)
        this.state = 68
        this.resource()
        this.state = 69
        this.match(FilterLanguageParser.T__4)
        this.state = 70
        this.index()
        this.state = 71
        this.match(FilterLanguageParser.T__4)
        this.state = 72
        this.index()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public resource(): ResourceContext {
    const localctx: ResourceContext = new ResourceContext(this, this._ctx, this.state)
    this.enterRule(localctx, 20, FilterLanguageParser.RULE_resource)
    let _la: number
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 74
        this.match(FilterLanguageParser.ALPHA)
        this.state = 78
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        while (_la === 20 || _la === 21) {
          {
            {
              this.state = 75
              _la = this._input.LA(1)
              if (!(_la === 20 || _la === 21)) {
                this._errHandler.recoverInline(this)
              } else {
                this._errHandler.reportMatch(this)
                this.consume()
              }
            }
          }
          this.state = 80
          this._errHandler.sync(this)
          _la = this._input.LA(1)
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public index(): IndexContext {
    const localctx: IndexContext = new IndexContext(this, this._ctx, this.state)
    this.enterRule(localctx, 22, FilterLanguageParser.RULE_index)
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 81
        this.match(FilterLanguageParser.PARAM_NAME)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public paramPath(): ParamPathContext {
    const localctx: ParamPathContext = new ParamPathContext(this, this._ctx, this.state)
    this.enterRule(localctx, 24, FilterLanguageParser.RULE_paramPath)
    let _la: number
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 83
        this.match(FilterLanguageParser.PARAM_NAME)
        this.state = 88
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        if (_la === 6) {
          {
            this.state = 84
            this.match(FilterLanguageParser.T__5)
            this.state = 85
            this.expression()
            this.state = 86
            this.match(FilterLanguageParser.T__6)
          }
        }

        this.state = 92
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        if (_la === 8) {
          {
            this.state = 90
            this.match(FilterLanguageParser.T__7)
            this.state = 91
            this.paramValue()
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }
  // @RuleVersion(0)
  public token(): TokenContext {
    const localctx: TokenContext = new TokenContext(this, this._ctx, this.state)
    this.enterRule(localctx, 26, FilterLanguageParser.RULE_token)
    let _la: number
    try {
      this.enterOuterAlt(localctx, 1)
      {
        this.state = 94
        _la = this._input.LA(1)
        if (!(_la === 13 || _la === 17)) {
          this._errHandler.recoverInline(this)
        } else {
          this._errHandler.reportMatch(this)
          this.consume()
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return localctx
  }

  public static readonly _serializedATN: number[] = [
    4, 1, 21, 97, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8,
    7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 1, 0, 1, 0, 3, 0, 31, 8, 0, 1, 1, 1, 1, 1,
    1, 4, 1, 36, 8, 1, 11, 1, 12, 1, 37, 1, 2, 1, 2, 3, 2, 42, 8, 2, 1, 3, 1, 3, 1, 3, 1, 4, 1, 4, 3, 4, 49, 8, 4, 1, 5,
    1, 5, 1, 5, 1, 5, 1, 6, 1, 6, 1, 6, 1, 6, 1, 7, 1, 7, 1, 7, 3, 7, 62, 8, 7, 1, 8, 1, 8, 3, 8, 66, 8, 8, 1, 9, 1, 9,
    1, 9, 1, 9, 1, 9, 1, 9, 1, 9, 1, 10, 1, 10, 5, 10, 77, 8, 10, 10, 10, 12, 10, 80, 9, 10, 1, 11, 1, 11, 1, 12, 1, 12,
    1, 12, 1, 12, 1, 12, 3, 12, 89, 8, 12, 1, 12, 1, 12, 3, 12, 93, 8, 12, 1, 13, 1, 13, 1, 13, 0, 0, 14, 0, 2, 4, 6, 8,
    10, 12, 14, 16, 18, 20, 22, 24, 26, 0, 3, 1, 0, 1, 2, 1, 0, 20, 21, 2, 0, 13, 13, 17, 17, 92, 0, 30, 1, 0, 0, 0, 2,
    32, 1, 0, 0, 0, 4, 41, 1, 0, 0, 0, 6, 43, 1, 0, 0, 0, 8, 48, 1, 0, 0, 0, 10, 50, 1, 0, 0, 0, 12, 54, 1, 0, 0, 0, 14,
    61, 1, 0, 0, 0, 16, 65, 1, 0, 0, 0, 18, 67, 1, 0, 0, 0, 20, 74, 1, 0, 0, 0, 22, 81, 1, 0, 0, 0, 24, 83, 1, 0, 0, 0,
    26, 94, 1, 0, 0, 0, 28, 31, 3, 4, 2, 0, 29, 31, 3, 2, 1, 0, 30, 28, 1, 0, 0, 0, 30, 29, 1, 0, 0, 0, 31, 1, 1, 0, 0,
    0, 32, 35, 3, 4, 2, 0, 33, 34, 7, 0, 0, 0, 34, 36, 3, 4, 2, 0, 35, 33, 1, 0, 0, 0, 36, 37, 1, 0, 0, 0, 37, 35, 1, 0,
    0, 0, 37, 38, 1, 0, 0, 0, 38, 3, 1, 0, 0, 0, 39, 42, 3, 6, 3, 0, 40, 42, 3, 8, 4, 0, 41, 39, 1, 0, 0, 0, 41, 40, 1,
    0, 0, 0, 42, 5, 1, 0, 0, 0, 43, 44, 5, 3, 0, 0, 44, 45, 3, 10, 5, 0, 45, 7, 1, 0, 0, 0, 46, 49, 3, 12, 6, 0, 47, 49,
    3, 10, 5, 0, 48, 46, 1, 0, 0, 0, 48, 47, 1, 0, 0, 0, 49, 9, 1, 0, 0, 0, 50, 51, 5, 18, 0, 0, 51, 52, 3, 0, 0, 0, 52,
    53, 5, 19, 0, 0, 53, 11, 1, 0, 0, 0, 54, 55, 3, 16, 8, 0, 55, 56, 5, 12, 0, 0, 56, 57, 3, 14, 7, 0, 57, 13, 1, 0, 0,
    0, 58, 62, 5, 10, 0, 0, 59, 62, 5, 11, 0, 0, 60, 62, 3, 26, 13, 0, 61, 58, 1, 0, 0, 0, 61, 59, 1, 0, 0, 0, 61, 60,
    1, 0, 0, 0, 62, 15, 1, 0, 0, 0, 63, 66, 3, 18, 9, 0, 64, 66, 3, 24, 12, 0, 65, 63, 1, 0, 0, 0, 65, 64, 1, 0, 0, 0,
    66, 17, 1, 0, 0, 0, 67, 68, 5, 4, 0, 0, 68, 69, 3, 20, 10, 0, 69, 70, 5, 5, 0, 0, 70, 71, 3, 22, 11, 0, 71, 72, 5,
    5, 0, 0, 72, 73, 3, 22, 11, 0, 73, 19, 1, 0, 0, 0, 74, 78, 5, 21, 0, 0, 75, 77, 7, 1, 0, 0, 76, 75, 1, 0, 0, 0, 77,
    80, 1, 0, 0, 0, 78, 76, 1, 0, 0, 0, 78, 79, 1, 0, 0, 0, 79, 21, 1, 0, 0, 0, 80, 78, 1, 0, 0, 0, 81, 82, 5, 13, 0, 0,
    82, 23, 1, 0, 0, 0, 83, 88, 5, 13, 0, 0, 84, 85, 5, 6, 0, 0, 85, 86, 3, 0, 0, 0, 86, 87, 5, 7, 0, 0, 87, 89, 1, 0,
    0, 0, 88, 84, 1, 0, 0, 0, 88, 89, 1, 0, 0, 0, 89, 92, 1, 0, 0, 0, 90, 91, 5, 8, 0, 0, 91, 93, 3, 16, 8, 0, 92, 90,
    1, 0, 0, 0, 92, 93, 1, 0, 0, 0, 93, 25, 1, 0, 0, 0, 94, 95, 7, 2, 0, 0, 95, 27, 1, 0, 0, 0, 9, 30, 37, 41, 48, 61,
    65, 78, 88, 92
  ]

  private static __ATN: ATN
  public static get _ATN(): ATN {
    if (!FilterLanguageParser.__ATN) {
      FilterLanguageParser.__ATN = new ATNDeserializer().deserialize(FilterLanguageParser._serializedATN)
    }

    return FilterLanguageParser.__ATN
  }

  static DecisionsToDFA = FilterLanguageParser._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  )
}

export class ExpressionContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public baseExpression(): BaseExpressionContext {
    return this.getTypedRuleContext(BaseExpressionContext, 0) as BaseExpressionContext
  }
  public logicalExpression(): LogicalExpressionContext {
    return this.getTypedRuleContext(LogicalExpressionContext, 0) as LogicalExpressionContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_expression
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterExpression) {
      listener.enterExpression(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitExpression) {
      listener.exitExpression(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitExpression) {
      return visitor.visitExpression(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class LogicalExpressionContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public baseExpression_list(): BaseExpressionContext[] {
    return this.getTypedRuleContexts(BaseExpressionContext) as BaseExpressionContext[]
  }
  public baseExpression(i: number): BaseExpressionContext {
    return this.getTypedRuleContext(BaseExpressionContext, i) as BaseExpressionContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_logicalExpression
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterLogicalExpression) {
      listener.enterLogicalExpression(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitLogicalExpression) {
      listener.exitLogicalExpression(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitLogicalExpression) {
      return visitor.visitLogicalExpression(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class BaseExpressionContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public notExpression(): NotExpressionContext {
    return this.getTypedRuleContext(NotExpressionContext, 0) as NotExpressionContext
  }
  public baseFilter(): BaseFilterContext {
    return this.getTypedRuleContext(BaseFilterContext, 0) as BaseFilterContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_baseExpression
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterBaseExpression) {
      listener.enterBaseExpression(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitBaseExpression) {
      listener.exitBaseExpression(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitBaseExpression) {
      return visitor.visitBaseExpression(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class NotExpressionContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public groupExpression(): GroupExpressionContext {
    return this.getTypedRuleContext(GroupExpressionContext, 0) as GroupExpressionContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_notExpression
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterNotExpression) {
      listener.enterNotExpression(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitNotExpression) {
      listener.exitNotExpression(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitNotExpression) {
      return visitor.visitNotExpression(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class BaseFilterContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public paramExp(): ParamExpContext {
    return this.getTypedRuleContext(ParamExpContext, 0) as ParamExpContext
  }
  public groupExpression(): GroupExpressionContext {
    return this.getTypedRuleContext(GroupExpressionContext, 0) as GroupExpressionContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_baseFilter
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterBaseFilter) {
      listener.enterBaseFilter(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitBaseFilter) {
      listener.exitBaseFilter(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitBaseFilter) {
      return visitor.visitBaseFilter(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class GroupExpressionContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public LPAR(): TerminalNode {
    return this.getToken(FilterLanguageParser.LPAR, 0)
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext
  }
  public RPAR(): TerminalNode {
    return this.getToken(FilterLanguageParser.RPAR, 0)
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_groupExpression
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterGroupExpression) {
      listener.enterGroupExpression(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitGroupExpression) {
      listener.exitGroupExpression(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitGroupExpression) {
      return visitor.visitGroupExpression(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class ParamExpContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public paramValue(): ParamValueContext {
    return this.getTypedRuleContext(ParamValueContext, 0) as ParamValueContext
  }
  public CompareOp(): TerminalNode {
    return this.getToken(FilterLanguageParser.CompareOp, 0)
  }
  public compValue(): CompValueContext {
    return this.getTypedRuleContext(CompValueContext, 0) as CompValueContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_paramExp
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterParamExp) {
      listener.enterParamExp(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitParamExp) {
      listener.exitParamExp(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitParamExp) {
      return visitor.visitParamExp(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class CompValueContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public NumberOrDate(): TerminalNode {
    return this.getToken(FilterLanguageParser.NumberOrDate, 0)
  }
  public String(): TerminalNode {
    return this.getToken(FilterLanguageParser.String, 0)
  }
  public token(): TokenContext {
    return this.getTypedRuleContext(TokenContext, 0) as TokenContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_compValue
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterCompValue) {
      listener.enterCompValue(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitCompValue) {
      listener.exitCompValue(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitCompValue) {
      return visitor.visitCompValue(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class ParamValueContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public hasSpecifier(): HasSpecifierContext {
    return this.getTypedRuleContext(HasSpecifierContext, 0) as HasSpecifierContext
  }
  public paramPath(): ParamPathContext {
    return this.getTypedRuleContext(ParamPathContext, 0) as ParamPathContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_paramValue
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterParamValue) {
      listener.enterParamValue(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitParamValue) {
      listener.exitParamValue(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitParamValue) {
      return visitor.visitParamValue(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class HasSpecifierContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public resource(): ResourceContext {
    return this.getTypedRuleContext(ResourceContext, 0) as ResourceContext
  }
  public index_list(): IndexContext[] {
    return this.getTypedRuleContexts(IndexContext) as IndexContext[]
  }
  public index(i: number): IndexContext {
    return this.getTypedRuleContext(IndexContext, i) as IndexContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_hasSpecifier
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterHasSpecifier) {
      listener.enterHasSpecifier(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitHasSpecifier) {
      listener.exitHasSpecifier(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitHasSpecifier) {
      return visitor.visitHasSpecifier(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class ResourceContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public ALPHA_list(): TerminalNode[] {
    return this.getTokens(FilterLanguageParser.ALPHA)
  }
  public ALPHA(i: number): TerminalNode {
    return this.getToken(FilterLanguageParser.ALPHA, i)
  }
  public NUMBER_list(): TerminalNode[] {
    return this.getTokens(FilterLanguageParser.NUMBER)
  }
  public NUMBER(i: number): TerminalNode {
    return this.getToken(FilterLanguageParser.NUMBER, i)
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_resource
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterResource) {
      listener.enterResource(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitResource) {
      listener.exitResource(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitResource) {
      return visitor.visitResource(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class IndexContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public PARAM_NAME(): TerminalNode {
    return this.getToken(FilterLanguageParser.PARAM_NAME, 0)
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_index
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterIndex) {
      listener.enterIndex(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitIndex) {
      listener.exitIndex(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitIndex) {
      return visitor.visitIndex(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class ParamPathContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public PARAM_NAME(): TerminalNode {
    return this.getToken(FilterLanguageParser.PARAM_NAME, 0)
  }
  public expression(): ExpressionContext {
    return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext
  }
  public paramValue(): ParamValueContext {
    return this.getTypedRuleContext(ParamValueContext, 0) as ParamValueContext
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_paramPath
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterParamPath) {
      listener.enterParamPath(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitParamPath) {
      listener.exitParamPath(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitParamPath) {
      return visitor.visitParamPath(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class TokenContext extends ParserRuleContext {
  constructor(parser?: FilterLanguageParser, parent?: ParserRuleContext, invokingState?: number) {
    super(parent, invokingState)
    this.parser = parser
  }
  public PARAM_NAME(): TerminalNode {
    return this.getToken(FilterLanguageParser.PARAM_NAME, 0)
  }
  public TOKEN(): TerminalNode {
    return this.getToken(FilterLanguageParser.TOKEN, 0)
  }
  public get ruleIndex(): number {
    return FilterLanguageParser.RULE_token
  }
  public enterRule(listener: FilterLanguageListener): void {
    if (listener.enterToken) {
      listener.enterToken(this)
    }
  }
  public exitRule(listener: FilterLanguageListener): void {
    if (listener.exitToken) {
      listener.exitToken(this)
    }
  }
  // @Override
  public accept<Result>(visitor: FilterLanguageVisitor<Result>): Result {
    if (visitor.visitToken) {
      return visitor.visitToken(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
