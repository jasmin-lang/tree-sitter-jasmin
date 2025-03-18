; Identifiers
[
  (identifier)
  (variable)
] @variable

; Function call
(call_expr
  function: (identifier) @function)

(intrinsic_expr
  intrinsic: (intrinsic) @function.builtin)

"ArrayInit" @function.builtin

; Function definitions
(function_definition
  name: (identifier) @function)

(parameter) @variable.parameter

; Namespaces
(namespace
  name: (identifier) @module)

; Types
[
 "int"
 "bool"
 ; "u8"
 ; "u16"
 ; "u32"
 ; "u64"
 ; "u128"
 ; "u256"
 (storage)
] @type.builtin
(type) @type

; Operators
[
 (operator)
 ":"
 "?"
] @operator

; Literals
(string_literal) @string
(int_literal) @number
[
 (true)
 (false)
] @constant.builtin

; Keywords
[
 "fn"
 "return"
 "from"
 "to"
 "downto"
 "require"
 "for"
 "while"
 "if"
 "else"
 "#aligned"
 "#unaligned"
 "export"
 "inline"
 "const"
 "mut"
 "reg"
 "stack"
 "param"
 "global"
] @keyword 

; Annotations
(annotations) @tag

; Punctuation
[
 "("
 ")"
 "["
 "]"
 "{"
 "}"
] @punctuation.bracket
";" @punctuation.delimiter

; Comments
(comment) @comment
