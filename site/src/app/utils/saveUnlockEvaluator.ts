// dynamic-import-only, never statically import this file; it carries the antlr4 runtime.
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
    verbose?: boolean;
}

type Log = (msg: string) => void;

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

function evalConditionNamed(ctx: ConditionContext, slugcat: string, c: SaveCollectibles, log?: Log): boolean {
    const childCount = ctx.getChildCount();

    if (childCount === 2) {
        // '!' condition
        const result = !evalConditionNamed(ctx.condition(), slugcat, c, log);
        log?.(`[named:${slugcat}] !(...) → ${result}`);
        return result;
    }

    const field = ctx.IDENTIFIER(0)?.getText() ?? '';

    if (childCount === 1) {
        // boolean field
        const state = c.oracleStates.get(slugcat);
        let result: boolean;
        switch (field) {
            case 'fp':             result = (state?.fpConversations ?? 0) > 0; break;
            case 'lttm':           result = (state?.moonEncounters ?? 0) > 0; break;
            case 'altEnding':      result = state?.altEnding ?? false; break;
            case 'pebblesHelped':  result = state?.pebblesHelped ?? false; break;
            case 'energyRailOff':  result = state?.energyRailOff ?? false; break;
            case 'looksToTheDoom': result = state?.looksToTheDoom ?? false; break;
            case 'zeroPebbles':    result = state?.zeroPebbles ?? false; break;
            case 'smPearlTagged':  result = state?.smPearlTagged ?? false; break;
            case 'hasMark':             result = slugcat === 'Saint' || slugcat === 'Rivulet' || (state?.hasMark ?? false); break;
            case 'lttmReadPearl':       result = state?.lttmReadPearl ?? false; break;
            case 'lttmDiscussedObject': result = state?.lttmDiscussedObject ?? false; break;
            default:
                console.warn(`[saveUnlock] unknown boolean field '${field}' in named scope`);
                result = false;
        }
        log?.(`[named:${slugcat}] ${field} → ${result}`);
        return result;
    }

    const secondText = ctx.getChild(1)?.getText() ?? '';

    if (secondText === '.') {
        // set membership: visited.RoomName or echo.GhostId
        const key = ctx.NUMBER()?.getText() ?? ctx.IDENTIFIER(1)?.getText() ?? '';
        let result: boolean;
        if (field === 'visited') result = c.slugcatVisitedRooms.get(slugcat)?.has(key) ?? false;
        else if (field === 'echo') result = c.slugcatEchoIds.get(slugcat)?.has(key) ?? false;
        else {
            console.warn(`[saveUnlock] unknown set accessor '${field}' in named scope`);
            result = false;
        }
        log?.(`[named:${slugcat}] ${field}.${key} → ${result}`);
        return result;
    }

    // numeric comparison: IDENTIFIER OP NUMBER
    const op = ctx.OP()?.getText() ?? '';
    const expected = parseFloat(ctx.NUMBER()?.getText() ?? '0');
    const state = c.oracleStates.get(slugcat);
    let actual: number;
    let result: boolean;
    switch (field) {
        case 'fp':           actual = state?.fpConversations ?? 0; result = applyOp(actual, op, expected); break;
        case 'lttm':         actual = state?.moonEncounters ?? 0; result = applyOp(actual, op, expected); break;
        case 'lttmMark':          actual = state?.moonEncountersWithMark ?? 0; result = applyOp(actual, op, expected); break;
        case 'lttmNeuronsLeft':   actual = state?.lttmNeuronsLeft ?? 0; result = applyOp(actual, op, expected); break;
        case 'lttmNeuronsGiven':  actual = state?.lttmNeuronsGiven ?? 0; result = applyOp(actual, op, expected); break;
        default:
            console.warn(`[saveUnlock] unknown numeric field '${field}' in named scope`);
            result = false; actual = 0;
    }
    log?.(`[named:${slugcat}] ${field} ${op} ${expected} (actual=${actual}) → ${result}`);
    return result;
}

function evalConditionWatcher(ctx: ConditionContext, c: SaveCollectibles, log?: Log): boolean {
    const childCount = ctx.getChildCount();
    const ws = c.watcherState;

    if (childCount === 2) {
        const result = !evalConditionWatcher(ctx.condition(), c, log);
        log?.(`[watcher] !(...) → ${result}`);
        return result;
    }

    const field = ctx.IDENTIFIER(0)?.getText() ?? '';

    if (childCount === 1) {
        let result: boolean;
        switch (field) {
            case 'rot':         result = ws?.spinningTopRot ?? false; break;
            case 'bath':        result = ws?.visitBath ?? false; break;
            case 'beaten':      result = c.watcherGlobal.beaten; break;
            case 'beatenST':    result = c.watcherGlobal.beatenSpinningTop; break;
            case 'beatenRot':   result = c.watcherGlobal.beatenSentientRot; break;
            case 'beatenWeaver':result = c.watcherGlobal.beatenVoidWeaver; break;
            case 'ascension':   result = c.watcherGlobal.watcherEndingID === 4; break;
            case 'projector':   result = ws?.visitedRooms.has('WAUA_PEARL') ?? false; break;
            default:
                console.warn(`[saveUnlock] unknown boolean field '${field}' in watcher scope`);
                result = false;
        }
        log?.(`[watcher] ${field} → ${result}`);
        return result;
    }

    const secondText = ctx.getChild(1)?.getText() ?? '';

    if (secondText === '.') {
        const key = ctx.NUMBER()?.getText() ?? ctx.IDENTIFIER(1)?.getText() ?? '';
        let result: boolean;
        switch (field) {
            case 'stSpawn':       result = ws?.spinningTopEncounters.includes(parseInt(key, 10)) ?? false; break;
            case 'visited':       result = ws?.visitedRooms.has(key) ?? false; break;
            case 'physicalPearl': result = ws?.physicalPearlTypes.has(key) ?? false; break;
            default:
                console.warn(`[saveUnlock] unknown set accessor '${field}' in watcher scope`);
                result = false;
        }
        log?.(`[watcher] ${field}.${key} → ${result}`);
        return result;
    }

    const op = ctx.OP()?.getText() ?? '';
    const expected = parseFloat(ctx.NUMBER()?.getText() ?? '0');
    let actual: number;
    let result: boolean;
    switch (field) {
        case 'maxRipple':   actual = ws?.maxRippleLevel ?? 0; result = applyOp(actual, op, expected); break;
        case 'minRipple':   actual = ws?.minRippleLevel ?? 0; result = applyOp(actual, op, expected); break;
        case 'stCount':     actual = ws?.spinningTopEncounters.length ?? 0; result = applyOp(actual, op, expected); break;
        case 'prince':      actual = ws?.highestPrinceConversationSeen ?? 0; result = applyOp(actual, op, expected); break;
        case 'princeCount': actual = ws?.numberOfPrinceEncounters ?? 0; result = applyOp(actual, op, expected); break;
        case 'weaver':      actual = ws?.numberOfVoidWeaverEncounters ?? 0; result = applyOp(actual, op, expected); break;
        case 'weaverProg':  actual = ws?.princeWeaverDialogProgression ?? 0; result = applyOp(actual, op, expected); break;
        case 'rotCount':    actual = ws?.rotInfectedRegionCount ?? 0; result = applyOp(actual, op, expected); break;
        default:
            console.warn(`[saveUnlock] unknown numeric field '${field}' in watcher scope`);
            result = false; actual = 0;
    }
    log?.(`[watcher] ${field} ${op} ${expected} (actual=${actual}) → ${result}`);
    return result;
}

function evalConditionGlobal(ctx: ConditionContext, c: SaveCollectibles, log?: Log): boolean {
    const childCount = ctx.getChildCount();

    if (childCount === 2) {
        const result = !evalConditionGlobal(ctx.condition(), c, log);
        log?.(`[global] !(...) → ${result}`);
        return result;
    }

    const field = ctx.IDENTIFIER(0)?.getText() ?? '';

    if (childCount === 1) {
        let result: boolean;
        switch (field) {
            case 'challenges':        result = c.allChallengesCompleted; break;
            case 'broadcastMiscLttm': result = c.broadcastMiscLttm; break;
            case 'broadcastMiscFp':   result = c.broadcastMiscFp; break;
            default:
                console.warn(`[saveUnlock] unknown boolean field '${field}' in global scope`);
                result = false;
        }
        log?.(`[global] ${field} → ${result}`);
        return result;
    }

    const secondText = ctx.getChild(1)?.getText() ?? '';

    if (secondText === '.') {
        const key = ctx.NUMBER()?.getText() ?? ctx.IDENTIFIER(1)?.getText() ?? '';
        let result: boolean;
        switch (field) {
            case 'pearl':            result = c.pearlSources.has(key); break;
            case 'pearlBase':        result = c.pearlSources.get(key)?.has('Base') ?? false; break;
            case 'pearlArtificer':   result = c.pearlSources.get(key)?.has('Artificer') ?? false; break;
            case 'pearlSpearmaster': result = c.pearlSources.get(key)?.has('Spearmaster') ?? false; break;
            case 'pearlSaint':       result = c.pearlSources.get(key)?.has('Saint') ?? false; break;
            case 'echo':             result = c.echoGhostIds.has(key); break;
            case 'broadcast':        result = c.broadcastInternalIds.has(key); break;
            case 'item':             result = c.itemTypesDescribed.has(key); break;
            case 'pearlSource':      result = Array.from(c.pearlSources.values()).some(s => s.has(key as 'Base' | 'Artificer' | 'Spearmaster' | 'Saint')); break;
            default:
                console.warn(`[saveUnlock] unknown set accessor '${field}' in global scope`);
                result = false;
        }
        log?.(`[global] ${field}.${key} → ${result}`);
        return result;
    }

    console.warn(`[saveUnlock] numeric comparison not supported in global scope for field '${field}'`);
    log?.(`[global] ${field} → false (numeric not supported in global)`);
    return false;
}

// ---- conditions list evaluation ----

function evalConditions(ctx: ConditionsContext, scope: ScopeInfo, c: SaveCollectibles, log?: Log): boolean {
    return ctx.condition_list().every(cond => evalCondition(cond, scope, c, log));
}

function evalCondition(ctx: ConditionContext, scope: ScopeInfo, c: SaveCollectibles, log?: Log): boolean {
    if (scope.kind === 'global') return evalConditionGlobal(ctx, c, log);
    if (scope.kind === 'watcher') return evalConditionWatcher(ctx, c, log);
    return evalConditionNamed(ctx, scope.slugcat, c, log);
}

// ---- block evaluation ----

function evalBlock(ctx: BlockContext, c: SaveCollectibles, log?: Log): boolean {
    const scopeName = ctx.IDENTIFIER().getText();

    let result: boolean;
    if (scopeName === 'global') {
        result = evalConditions(ctx.conditions(), { kind: 'global' }, c, log);
    } else if (scopeName === 'watcher') {
        if (!c.watcherState) { result = false; }
        else result = evalConditions(ctx.conditions(), { kind: 'watcher' }, c, log);
    } else if (scopeName === 'any') {
        const condList = ctx.conditions().condition_list();
        const slugcats = Array.from(c.oracleStates.keys());
        result = false;
        for (const slug of slugcats) {
            if (condList.every(cond => evalConditionNamed(cond, slug, c, log))) { result = true; break; }
        }
    } else {
        if (!c.oracleStates.has(scopeName)) { result = false; }
        else result = evalConditions(ctx.conditions(), { kind: 'named', slugcat: scopeName }, c, log);
    }

    log?.(`[block] ${scopeName} → ${result}`);
    return result;
}

// ---- expression evaluation ----

function evalExpression(ctx: ExpressionContext, c: SaveCollectibles, log?: Log): boolean {
    const blocks = ctx.block_list();
    const ops = ctx.logicOp_list();

    let result = evalBlock(blocks[0], c, log);
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i].getText();
        const next = evalBlock(blocks[i + 1], c, log);
        if (op === 'and') result = result && next;
        else result = result || next;
    }
    return result;
}

// ---- public API ----

export function evaluate(expression: string, ctx: EvalContext): boolean {
    const log: Log | undefined = ctx.verbose ? (msg) => console.log(`[saveUnlock] ${msg}`) : undefined;
    if (log) log(`evaluating: "${expression}"`);
    try {
        const chars = new CharStream(expression);
        const lexer = new SaveUnlockLexer(chars);
        lexer.removeErrorListeners();
        const tokens = new CommonTokenStream(lexer);
        const parser = new SaveUnlockParser(tokens);
        parser.removeErrorListeners();
        const tree = parser.expression();
        const result = evalExpression(tree, ctx.collectibles, log);
        if (log) log(`result: ${result}`);
        return result;
    } catch (e) {
        console.warn(`[saveUnlock] parse/eval error for expression "${expression}":`, e);
        return false;
    }
}
