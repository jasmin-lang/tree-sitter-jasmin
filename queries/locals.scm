; Scopes 
[
  (block)
  (function_body)
] @local.scope

; Definitions
[
  (parameter)
  (variable)
] @local.definition

(type_definition
 alias_name: (identifier) @local.definition.type)

; References
(identifier) @local.reference

((type_alias) @local.reference
 (#set! reference.kind "type"))
