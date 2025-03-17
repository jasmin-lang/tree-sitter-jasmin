; Functions
(function_definition
  name: (identifier) @name) @definition.function

(call_expr
  function: (identifier) @name) @reference.call

(intrinsic_expr
  intrinsic: (intrinsic) @name) @reference.call

; "Modules"
(namespace
  name: (identifier) @name) @definition.module
