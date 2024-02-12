grammar FilterLanguage;


expression
        : baseExpression
        | logicalExpression ;

logicalExpression: baseExpression (('and' | 'or') baseExpression)+ ;

baseExpression
        : notExpression
        | baseFilter ;

notExpression: 'not' groupExpression ;

baseFilter 
        :  paramExp
        | groupExpression ;

groupExpression
        : LPAR expression RPAR ;

paramExp: paramValue CompareOp compValue ;

compValue: NumberOrDate | String | token ;

paramValue: hasSpecifier | paramPath ;

hasSpecifier: '_has:' resource ':' index ':' index ;

resource: ALPHA (NUMBER | ALPHA)* ;

index: PARAM_NAME ;

paramPath: PARAM_NAME ('[' expression ']')? ('.' paramValue)? ;

SP : [ \t\r\n]+ -> skip; // skip whitespace

token: PARAM_NAME | TOKEN ;

NumberOrDate: NUMBER (DateChar)* ;

String: JSON_STRING ;

CompareOp : 'eq'   // An item in the set has an equal value
        | 'ne'   // An item in the set has an unequal value
        | 'Co'   // An item in the set contains this value
        | 'sw'   // An item in the set starts with this value
        | 'ew'   // An item in the set ends with this value
        | 'gt'   // A value in the set is greater than the given value
        | 'lt'   // A value in the set is less than the given value
        | 'ge'   // A value in the set is greater or equal to the given value
        | 'le'   // A value in the set is less or equal to the given value
        | 'ap'   // A value in the set is approximately the same as this value (10% recommended)
        | 'sa'   // The value starts after the specified value
        | 'eb'   // The value ends before the specified value
        | 'pr'   // The set is empty or not (value is false or true)
        | 'po'   // True if a (implied) date period in the set overlaps with the implied period in the value
        | 'ss'   // True if the value subsumes a concept in the set
        | 'sb'   // True if the value is subsumed by a concept in the set
        | 'in'   // True if one of the concepts is in the nominated value set by URI
        | 'ni'   // True if none of the concepts are in the nominated value set by URI
        | 're';  // True if one of the references in set points to the given URL


PARAM_NAME: NameCharStart NameChar* ;

NameChar: NameCharStart | '-' | DIGIT ;

NameCharStart: '_' | ALPHA ;

JSON_STRING: '"' (ESC | ~["\\])*? '"' ;

TOKEN : (ALPHA | DIGIT | UNICODE)+ ;

fragment DateChar: NUMBER | 'T' | '-' | '.' | '+' | ':' | 'Z' ;

fragment ESC : '\\' (["\\/bfnrt] | UNICODE) ;

fragment UNICODE : 'u' HEX HEX HEX HEX ;

fragment HEX : [0-9a-fA-F] ;

fragment DIGIT : [0-9] ;

LPAR: '(' ;

RPAR: ')' ;

NUMBER         : DIGIT+ ([.,] DIGIT+)? ;

ALPHA : [a-zA-Z] ;

