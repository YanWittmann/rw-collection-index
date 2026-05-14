// Generated from SaveUnlock.g4 by ANTLR 4.13.2

import {ParseTreeVisitor} from 'antlr4';


import { ExpressionContext } from "./SaveUnlockParser";
import { BlockContext } from "./SaveUnlockParser";
import { ConditionsContext } from "./SaveUnlockParser";
import { ConditionContext } from "./SaveUnlockParser";
import { LogicOpContext } from "./SaveUnlockParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `SaveUnlockParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class SaveUnlockVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `SaveUnlockParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by `SaveUnlockParser.block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBlock?: (ctx: BlockContext) => Result;
	/**
	 * Visit a parse tree produced by `SaveUnlockParser.conditions`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConditions?: (ctx: ConditionsContext) => Result;
	/**
	 * Visit a parse tree produced by `SaveUnlockParser.condition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCondition?: (ctx: ConditionContext) => Result;
	/**
	 * Visit a parse tree produced by `SaveUnlockParser.logicOp`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLogicOp?: (ctx: LogicOpContext) => Result;
}

