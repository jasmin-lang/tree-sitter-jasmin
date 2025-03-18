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

(type_alias
 alias_name: (identifier) @local.definition.type)

; References
(identifier) @local.reference

((alias_type) @local.reference
 (#set! reference.kind "type"))
