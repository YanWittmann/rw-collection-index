// dynamic-import-only — never statically import this file; it carries the antlr4 runtime.
import { CharStream, CommonTokenStream } from 'antlr4';
import SaveUnlockLexer from './grammar/SaveUnlockLexer';
import SaveUnlockParser, {
    BlockContext,
    ConditionContext,
    ConditionsContext,
    ExpressionContext,
} from './grammar/SaveUnlockParser';
import { SaveCollectibles } from './saveCollectibles';

export interface EvalContext {
    collectibles: SaveCollectibles;
}

// ---- scope helpers ----

interface NamedScope {
    kind: 'named';
    slugcat: string;
}
interface GlobalScope { kind: 'global'; }
interface WatcherScope { kind: 'watcher'; }
type ScopeInfo = GlobalScope | NamedScope | WatcherScope;

function applyOp(actual: number, op: string, expected: number): boolean {
    switch (op) {
        case '>=': return actual >= expected;
        case '>':  return actual > expected;
        case '<=': return actual <= expected;
        case '<':  return actual < expected;
        case '=':  return actual === expected;
        case '!=': return actual !== expected;
        default:   return false;
    }
}

// ---- condition evaluators per scope ----

function evalConditionNamed(ctx: ConditionContext, slugcat: string, c: SaveCollectibles): boolean {
    const childCount = ctx.getChildCount();

    if (childCount === 2) {
        // '!' condition
        return !evalConditionNamed(ctx.condition(), slugcat, c);
    }

    const field = ctx.IDENTIFIER(0)?.getText() ?? '';

    if (childCount === 1) {
        // boolean field
        const state = c.oracleStates.get(slugcat);
        switch (field) {
            case 'fp':             return (state?.fpConversations ?? 0) > 0;
            case 'lttm':           return (state?.moonEncounters ?? 0) > 0;
            case 'altEnding':      return state?.altEnding ?? false;
            case 'pebblesHelped':  return state?.pebblesHelped ?? false;
            case 'energyRailOff':  return state?.energyRailOff ?? false;
            case 'looksToTheDoom': return state?.looksToTheDoom ?? false;
            case 'zeroPebbles':    return state?.zeroPebbles ?? false;
            case 'smPearlTagged':  return state?.smPearlTagged ?? false;
            default:
                console.warn(`[save-unlock] unknown boolean field '${field}' in named scope`);
                return false;
        }
    }

    const secondText = ctx.getChild(1)?.getText() ?? '';

    if (secondText === '.') {
        // set membership: visited.RoomName
        const key = ctx.INT()?.getText() ?? ctx.IDENTIFIER(1)?.getText() ?? '';
        if (field === 'visited') return c.slugcatVisitedRooms.get(slugcat)?.has(key) ?? false;
        if (field === 'echo')    return c.slugcatEchoIds.get(slugcat)?.has(key) ?? false;
        console.warn(`[save-unlock] unknown set accessor '${field}' in named scope`);
        return false;
    }

    // numeric comparison: IDENTIFIER OP NUMBER
    const op = ctx.OP()?.getText() ?? '';
    const expected = parseFloat(ctx.NUMBER()?.getText() ?? '0');
    const state = c.oracleStates.get(slugcat);
    switch (field) {
        case 'fp':           return applyOp(state?.fpConversations ?? 0, op, expected);
        case 'lttm':         return applyOp(state?.moonEncounters ?? 0, op, expected);
        case 'moonMark':     return applyOp(state?.moonEncountersWithMark ?? 0, op, expected);
        case 'neuronsGiven': return applyOp(state?.neuronsGiven ?? 0, op, expected);
        default:
            console.warn(`[save-unlock] unknown numeric field '${field}' in named scope`);
            return false;
    }
}

function evalConditionWatcher(ctx: ConditionContext, c: SaveCollectibles): boolean {
    const childCount = ctx.getChildCount();
    const ws = c.watcherState;

    if (childCount === 2) {
        return !evalConditionWatcher(ctx.condition(), c);
    }

    const field = ctx.IDENTIFIER(0)?.getText() ?? '';

    if (childCount === 1) {
        switch (field) {
            case 'rot':         return ws?.spinningTopRot ?? false;
            case 'bath':        return ws?.visitBath ?? false;
            case 'weaverAck':   return (ws?.princeWeaverGrowthAcknowledgement ?? 0) === 1;
            case 'beaten':      return c.watcherGlobal.beaten;
            case 'beatenST':    return c.watcherGlobal.beatenSpinningTop;
            case 'beatenRot':   return c.watcherGlobal.beatenSentientRot;
            case 'beatenWeaver':return c.watcherGlobal.beatenVoidWeaver;
            case 'ascension':   return c.watcherGlobal.watcherEndingID === 4;
            case 'projector':   return ws?.visitedRooms.has('WAUA_PEARL') ?? false;
            default:
                console.warn(`[save-unlock] unknown boolean field '${field}' in watcher scope`);
                return false;
        }
    }

    const secondText = ctx.getChild(1)?.getText() ?? '';

    if (secondText === '.') {
        const key = ctx.INT()?.getText() ?? ctx.IDENTIFIER(1)?.getText() ?? '';
        switch (field) {
            case 'stSpawn':       return ws?.spinningTopEncounters.includes(parseInt(key, 10)) ?? false;
            case 'visited':       return ws?.visitedRooms.has(key) ?? false;
            case 'physicalPearl': return ws?.physicalPearlTypes.has(key) ?? false;
            default:
                console.warn(`[save-unlock] unknown set accessor '${field}' in watcher scope`);
                return false;
        }
    }

    const op = ctx.OP()?.getText() ?? '';
    const expected = parseFloat(ctx.NUMBER()?.getText() ?? '0');
    switch (field) {
        case 'maxRipple':   return applyOp(ws?.maxRippleLevel ?? 0, op, expected);
        case 'minRipple':   return applyOp(ws?.minRippleLevel ?? 0, op, expected);
        case 'stCount':     return applyOp(ws?.spinningTopEncounters.length ?? 0, op, expected);
        case 'prince':      return applyOp(ws?.highestPrinceConversationSeen ?? 0, op, expected);
        case 'princeCount': return applyOp(ws?.numberOfPrinceEncounters ?? 0, op, expected);
        case 'weaver':      return applyOp(ws?.numberOfVoidWeaverEncounters ?? 0, op, expected);
        case 'weaverProg':  return applyOp(ws?.princeWeaverDialogProgression ?? 0, op, expected);
        default:
            console.warn(`[save-unlock] unknown numeric field '${field}' in watcher scope`);
            return false;
    }
}

function evalConditionGlobal(ctx: ConditionContext, c: SaveCollectibles): boolean {
    const childCount = ctx.getChildCount();

    if (childCount === 2) {
        return !evalConditionGlobal(ctx.condition(), c);
    }

    const field = ctx.IDENTIFIER(0)?.getText() ?? '';

    if (childCount === 1) {
        switch (field) {
            case 'challenges':       return c.allChallengesCompleted;
            case 'broadcastMiscLttM': return c.broadcastMiscLttM;
            case 'broadcastMiscFP':  return c.broadcastMiscFP;
        }
        console.warn(`[save-unlock] unknown boolean field '${field}' in global scope`);
        return false;
    }

    const secondText = ctx.getChild(1)?.getText() ?? '';

    if (secondText === '.') {
        const key = ctx.INT()?.getText() ?? ctx.IDENTIFIER(1)?.getText() ?? '';
        switch (field) {
            case 'pearl':            return c.pearlSources.has(key);
            case 'pearlBase':        return c.pearlSources.get(key)?.has('base') ?? false;
            case 'pearlArtificer':   return c.pearlSources.get(key)?.has('artificer') ?? false;
            case 'pearlSpearmaster': return c.pearlSources.get(key)?.has('spearmaster') ?? false;
            case 'pearlSaint':       return c.pearlSources.get(key)?.has('saint') ?? false;
            case 'echo':             return c.echoGhostIds.has(key);
            case 'broadcast':        return c.broadcastInternalIds.has(key);
            case 'item':             return c.itemTypesDescribed.has(key);
            case 'pearlSource':      return Array.from(c.pearlSources.values()).some(s => s.has(key as 'base' | 'artificer' | 'spearmaster' | 'saint'));
            default:
                console.warn(`[save-unlock] unknown set accessor '${field}' in global scope`);
                return false;
        }
    }

    console.warn(`[save-unlock] numeric comparison not supported in global scope for field '${field}'`);
    return false;
}

// ---- conditions list evaluation ----

function evalConditions(ctx: ConditionsContext, scope: ScopeInfo, c: SaveCollectibles): boolean {
    return ctx.condition_list().every(cond => evalCondition(cond, scope, c));
}

function evalCondition(ctx: ConditionContext, scope: ScopeInfo, c: SaveCollectibles): boolean {
    if (scope.kind === 'global') return evalConditionGlobal(ctx, c);
    if (scope.kind === 'watcher') return evalConditionWatcher(ctx, c);
    return evalConditionNamed(ctx, scope.slugcat, c);
}

// ---- block evaluation ----

function evalBlock(ctx: BlockContext, c: SaveCollectibles): boolean {
    const scopeName = ctx.IDENTIFIER().getText();

    if (scopeName === 'global') {
        return evalConditions(ctx.conditions(), { kind: 'global' }, c);
    }

    if (scopeName === 'watcher') {
        if (!c.watcherState) return false;
        return evalConditions(ctx.conditions(), { kind: 'watcher' }, c);
    }

    if (scopeName === 'any') {
        const condList = ctx.conditions().condition_list();
        const slugcats = Array.from(c.oracleStates.keys());
        for (const slug of slugcats) {
            if (condList.every(cond => evalConditionNamed(cond, slug, c))) return true;
        }
        return false;
    }

    // Named slugcat scope
    if (!c.oracleStates.has(scopeName)) return false;
    return evalConditions(ctx.conditions(), { kind: 'named', slugcat: scopeName }, c);
}

// ---- expression evaluation ----

function evalExpression(ctx: ExpressionContext, c: SaveCollectibles): boolean {
    const blocks = ctx.block_list();
    const ops = ctx.logicOp_list();

    let result = evalBlock(blocks[0], c);
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i].getText();
        const next = evalBlock(blocks[i + 1], c);
        if (op === 'and') result = result && next;
        else result = result || next;
    }
    return result;
}

// ---- public API ----

export function evaluate(expression: string, ctx: EvalContext): boolean {
    try {
        const chars = new CharStream(expression);
        const lexer = new SaveUnlockLexer(chars);
        lexer.removeErrorListeners();
        const tokens = new CommonTokenStream(lexer);
        const parser = new SaveUnlockParser(tokens);
        parser.removeErrorListeners();
        const tree = parser.expression();
        return evalExpression(tree, ctx.collectibles);
    } catch (e) {
        console.warn(`[save-unlock] parse/eval error for expression "${expression}":`, e);
        return false;
    }
}
