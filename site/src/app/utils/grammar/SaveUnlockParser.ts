// Generated from SaveUnlock.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import SaveUnlockVisitor from "./SaveUnlockVisitor";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class SaveUnlockParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly OP = 7;
	public static readonly IDENTIFIER = 8;
	public static readonly INT = 9;
	public static readonly NUMBER = 10;
	public static readonly WS = 11;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_expression = 0;
	public static readonly RULE_block = 1;
	public static readonly RULE_conditions = 2;
	public static readonly RULE_condition = 3;
	public static readonly RULE_logicOp = 4;
	public static readonly literalNames: (string | null)[] = [ null, "'{'", 
                                                            "'}'", "'and'", 
                                                            "'!'", "'.'", 
                                                            "'or'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "OP", 
                                                             "IDENTIFIER", 
                                                             "INT", "NUMBER", 
                                                             "WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"expression", "block", "conditions", "condition", "logicOp",
	];
	public get grammarFileName(): string { return "SaveUnlock.g4"; }
	public get literalNames(): (string | null)[] { return SaveUnlockParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return SaveUnlockParser.symbolicNames; }
	public get ruleNames(): string[] { return SaveUnlockParser.ruleNames; }
	public get serializedATN(): number[] { return SaveUnlockParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, SaveUnlockParser._ATN, SaveUnlockParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public expression(): ExpressionContext {
		let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, SaveUnlockParser.RULE_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 10;
			this.block();
			this.state = 16;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3 || _la===6) {
				{
				{
				this.state = 11;
				this.logicOp();
				this.state = 12;
				this.block();
				}
				}
				this.state = 18;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, SaveUnlockParser.RULE_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 19;
			this.match(SaveUnlockParser.IDENTIFIER);
			this.state = 20;
			this.match(SaveUnlockParser.T__0);
			this.state = 21;
			this.conditions();
			this.state = 22;
			this.match(SaveUnlockParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public conditions(): ConditionsContext {
		let localctx: ConditionsContext = new ConditionsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, SaveUnlockParser.RULE_conditions);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 24;
			this.condition();
			this.state = 29;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3) {
				{
				{
				this.state = 25;
				this.match(SaveUnlockParser.T__2);
				this.state = 26;
				this.condition();
				}
				}
				this.state = 31;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public condition(): ConditionContext {
		let localctx: ConditionContext = new ConditionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, SaveUnlockParser.RULE_condition);
		let _la: number;
		try {
			this.state = 41;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 32;
				this.match(SaveUnlockParser.T__3);
				this.state = 33;
				this.condition();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 34;
				this.match(SaveUnlockParser.IDENTIFIER);
				this.state = 35;
				this.match(SaveUnlockParser.OP);
				this.state = 36;
				this.match(SaveUnlockParser.NUMBER);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 37;
				this.match(SaveUnlockParser.IDENTIFIER);
				this.state = 38;
				this.match(SaveUnlockParser.T__4);
				this.state = 39;
				_la = this._input.LA(1);
				if(!(_la===8 || _la===9)) {
				this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 40;
				this.match(SaveUnlockParser.IDENTIFIER);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public logicOp(): LogicOpContext {
		let localctx: LogicOpContext = new LogicOpContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, SaveUnlockParser.RULE_logicOp);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 43;
			_la = this._input.LA(1);
			if(!(_la===3 || _la===6)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public static readonly _serializedATN: number[] = [4,1,11,46,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,1,0,1,0,1,0,1,0,5,0,15,8,0,10,0,12,0,18,9,
	0,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,2,5,2,28,8,2,10,2,12,2,31,9,2,1,3,1,3,1,
	3,1,3,1,3,1,3,1,3,1,3,1,3,3,3,42,8,3,1,4,1,4,1,4,0,0,5,0,2,4,6,8,0,2,1,
	0,8,9,2,0,3,3,6,6,45,0,10,1,0,0,0,2,19,1,0,0,0,4,24,1,0,0,0,6,41,1,0,0,
	0,8,43,1,0,0,0,10,16,3,2,1,0,11,12,3,8,4,0,12,13,3,2,1,0,13,15,1,0,0,0,
	14,11,1,0,0,0,15,18,1,0,0,0,16,14,1,0,0,0,16,17,1,0,0,0,17,1,1,0,0,0,18,
	16,1,0,0,0,19,20,5,8,0,0,20,21,5,1,0,0,21,22,3,4,2,0,22,23,5,2,0,0,23,3,
	1,0,0,0,24,29,3,6,3,0,25,26,5,3,0,0,26,28,3,6,3,0,27,25,1,0,0,0,28,31,1,
	0,0,0,29,27,1,0,0,0,29,30,1,0,0,0,30,5,1,0,0,0,31,29,1,0,0,0,32,33,5,4,
	0,0,33,42,3,6,3,0,34,35,5,8,0,0,35,36,5,7,0,0,36,42,5,10,0,0,37,38,5,8,
	0,0,38,39,5,5,0,0,39,42,7,0,0,0,40,42,5,8,0,0,41,32,1,0,0,0,41,34,1,0,0,
	0,41,37,1,0,0,0,41,40,1,0,0,0,42,7,1,0,0,0,43,44,7,1,0,0,44,9,1,0,0,0,3,
	16,29,41];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!SaveUnlockParser.__ATN) {
			SaveUnlockParser.__ATN = new ATNDeserializer().deserialize(SaveUnlockParser._serializedATN);
		}

		return SaveUnlockParser.__ATN;
	}


	static DecisionsToDFA = SaveUnlockParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ExpressionContext extends ParserRuleContext {
	constructor(parser?: SaveUnlockParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public block_list(): BlockContext[] {
		return this.getTypedRuleContexts(BlockContext) as BlockContext[];
	}
	public block(i: number): BlockContext {
		return this.getTypedRuleContext(BlockContext, i) as BlockContext;
	}
	public logicOp_list(): LogicOpContext[] {
		return this.getTypedRuleContexts(LogicOpContext) as LogicOpContext[];
	}
	public logicOp(i: number): LogicOpContext {
		return this.getTypedRuleContext(LogicOpContext, i) as LogicOpContext;
	}
    public get ruleIndex(): number {
    	return SaveUnlockParser.RULE_expression;
	}
	// @Override
	public accept<Result>(visitor: SaveUnlockVisitor<Result>): Result {
		if (visitor.visitExpression) {
			return visitor.visitExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockContext extends ParserRuleContext {
	constructor(parser?: SaveUnlockParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(SaveUnlockParser.IDENTIFIER, 0);
	}
	public conditions(): ConditionsContext {
		return this.getTypedRuleContext(ConditionsContext, 0) as ConditionsContext;
	}
    public get ruleIndex(): number {
    	return SaveUnlockParser.RULE_block;
	}
	// @Override
	public accept<Result>(visitor: SaveUnlockVisitor<Result>): Result {
		if (visitor.visitBlock) {
			return visitor.visitBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConditionsContext extends ParserRuleContext {
	constructor(parser?: SaveUnlockParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public condition_list(): ConditionContext[] {
		return this.getTypedRuleContexts(ConditionContext) as ConditionContext[];
	}
	public condition(i: number): ConditionContext {
		return this.getTypedRuleContext(ConditionContext, i) as ConditionContext;
	}
    public get ruleIndex(): number {
    	return SaveUnlockParser.RULE_conditions;
	}
	// @Override
	public accept<Result>(visitor: SaveUnlockVisitor<Result>): Result {
		if (visitor.visitConditions) {
			return visitor.visitConditions(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConditionContext extends ParserRuleContext {
	constructor(parser?: SaveUnlockParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public condition(): ConditionContext {
		return this.getTypedRuleContext(ConditionContext, 0) as ConditionContext;
	}
	public IDENTIFIER_list(): TerminalNode[] {
	    	return this.getTokens(SaveUnlockParser.IDENTIFIER);
	}
	public IDENTIFIER(i: number): TerminalNode {
		return this.getToken(SaveUnlockParser.IDENTIFIER, i);
	}
	public OP(): TerminalNode {
		return this.getToken(SaveUnlockParser.OP, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(SaveUnlockParser.NUMBER, 0);
	}
	public INT(): TerminalNode {
		return this.getToken(SaveUnlockParser.INT, 0);
	}
    public get ruleIndex(): number {
    	return SaveUnlockParser.RULE_condition;
	}
	// @Override
	public accept<Result>(visitor: SaveUnlockVisitor<Result>): Result {
		if (visitor.visitCondition) {
			return visitor.visitCondition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LogicOpContext extends ParserRuleContext {
	constructor(parser?: SaveUnlockParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return SaveUnlockParser.RULE_logicOp;
	}
	// @Override
	public accept<Result>(visitor: SaveUnlockVisitor<Result>): Result {
		if (visitor.visitLogicOp) {
			return visitor.visitLogicOp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
