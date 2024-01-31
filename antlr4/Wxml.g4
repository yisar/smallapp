grammar Wxml;

wxml
 : element*
 ;

element
 : OPEN_TAG attribute* CLOSE_TAG
 | OPEN_TAG attribute* '>' content* '</' IDENTIFIER '>'
 ;

attribute
 : IDENTIFIER '=' STRING_LITERAL
 | IDENTIFIER '=' DYNAMIC_EXPRESSION
 ;

content
 : TEXT
 | element
 ;

DYNAMIC_EXPRESSION
 : '{{' IDENTIFIER ('.' IDENTIFIER)* '}}'
 ;

OPEN_TAG
 : '<' IDENTIFIER
 ;

CLOSE_TAG
 : '/>'
 | '>' // Assuming self-closing tags are handled by the CLOSE_TAG rule
 ;

IDENTIFIER
 : [a-zA-Z_][a-zA-Z_0-9-]*
 ;

STRING_LITERAL
 : '"' (~["\\]|'\\'.)* '"'
 | '\'' (~['\\]|'\\'.)* '\''
 ;

TEXT
 : ~[<]+
 ;

WS
 : [ \t\r\n]+ -> skip
 ;
