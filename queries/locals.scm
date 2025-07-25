; Scopes 
[
  (block)
  (function_body)
] @local.scope

(namespace
  code: _ @local.scope)

; References
(variable) @local.reference

((type_alias) @local.reference
  (#set! reference.kind "type"))

; Definitions
((type_definition
  alias_name: (identifier) @local.definition)
  (#set! definition.kind "type"))

((function_definition
  name: (identifier) @local.definition)
  (#set! definition.kind "function"))

((var_decl
  (variable) @local.definition)
  (#set! definition.kind "variable"))

((namespace
  name: (identifier) @local.definition)
  (#set! definition.kind "namespace"))

