; Identifiers
(variable) @variable

(ignore) @variable.builtin

; Function call
(call_expr
  function: (identifier) @function.call)

(call_instr
  function: (identifier) @function.call)

(intrinsic_expr
  intrinsic: (intrinsic) @function.macro)

"ArrayInit" @function.builtin

(exec "exec" @function.builtin)

; Function definitions
(function_definition
  name: (identifier) @function.definition)

(parameter) @variable.parameter

; Namespaces
(namespace
  name: (identifier) @module)

; Types
[
 (int_type)
 (bool_type)
 (utype)
 (swsize)
 (svsize)
 (storage)
] @type.builtin

(type_alias) @type
(access_type) @type
(array_type
  type: (identifier) @type)

(type_definition
  alias_name: (identifier) @type.definition)

; Operators
[
 (operator)
] @operator

; Literals
(string_literal) @string

(int_literal) @number

[
 (true)
 (false)
] @constant.builtin

(escape_sequence) @string.escape

; Keywords
"fn" @keyword.function

"return" @keyword.return

[
  "for"
  "to"
  "downto"
  "while"
] @keyword.repeat

[
  "if"
  "else"
] @keyword.conditional

(ternary_expr
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)

[
  "require"
  "from"
] @keyword.import

[
 "type"
] @keyword.type

[
 "export"
 "inline"
 "const"
 "mut"
 "reg"
 "stack"
] @keyword.modifier

[
 "#aligned"
 "#unaligned"
 "param"
 "global"
] @keyword 

; Annotations
(annotations) @attribute

; Punctuation
[
 "("
 ")"
 "["
 "]"
 "{"
 "}"
] @punctuation.bracket

[
  ";"
  ","
] @punctuation.delimiter

(range ":" @punctuation.delimiter)

; Comments
(comment) @comment
