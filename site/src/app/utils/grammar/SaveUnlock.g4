grammar SaveUnlock;

// Entry point: one or more scope blocks combined with 'and'/'or'.
// Multiple save-unlock lines are OR-ed externally; one line is one expression.
expression
    : block (logicOp block)*
    ;

block
    : IDENTIFIER '{' conditions '}'
    ;

conditions
    : condition ('and' condition)*
    ;

condition
    : '!' condition                                 // negation
    | IDENTIFIER OP NUMBER                          // numeric comparison: fp >= 3
    | IDENTIFIER '.' (IDENTIFIER | NUMBER)         // set membership: visited.SL_AI, stSpawn.0
    | IDENTIFIER                                    // boolean field: altEnding
    ;

logicOp : 'and' | 'or' ;

OP  : '>=' | '<=' | '>' | '<' | '=' | '!=' ;

IDENTIFIER : [a-zA-Z_][a-zA-Z0-9_]* ;
NUMBER     : [0-9]+ ('.' [0-9]+)? ;
WS         : [ \t\n\r]+ -> skip ;
