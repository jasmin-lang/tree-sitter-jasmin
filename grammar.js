/**
 * @file Jasmin grammar for tree-sitter
 * @author Tom Béné <tom@fantomebeig.net>
 * @license MIT
 * @see {@link https://github.com/jasmin-lang/jasmin|Jasmin source repository}
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const SIZE = /(8|16|32|64|128|256)/;
const SIGNLETTER = /(s|u)/;
const GENSIZE = /(1|2|4|8|16|32|64|128)/;
const VSIZE = /(2|4|8|16|32)/;
const WSIGN = /(s|u)i?/;

const hexDigit = /[0-9a-fA-F]/;
const octalDigit = /[0-7]/;
const decimalDigit = /[0-9]/;
const binaryDigit = /[01]/;

const hexDigits = seq(hexDigit, repeat(seq(optional("_"), hexDigit)));
const octalDigits = seq(octalDigit, repeat(seq(optional("_"), octalDigit)));
const decimalDigits = seq(
  decimalDigit,
  repeat(seq(optional("_"), decimalDigit)),
);
const binaryDigits = seq(binaryDigit, repeat(seq(optional("_"), binaryDigit)));

const hexLiteral = seq("0", choice("x", "X"), optional("_"), hexDigits);
const octalLiteral = seq(
  "0",
  optional(choice("o", "O")),
  optional("_"),
  octalDigits,
);
const decimalLiteral = choice(
  "0",
  seq(/[1-9]/, optional(seq(optional("_"), decimalDigits))),
);
const binaryLiteral = seq("0", choice("b", "B"), optional("_"), binaryDigits);

const intLiteral = choice(
  binaryLiteral,
  decimalLiteral,
  octalLiteral,
  hexLiteral,
);

const PREC = {
  call: 15,
  access: 8,
  unary: 6,
  multiplicative: 5,
  additive: 4,
  comparative: 3,
  and: 2,
  or: 1,
  conditional: -1,
  assignment: -2,
};

const multiplicativeOperators = [
  "*",
  seq("/", optional(SIGNLETTER)),
  seq("%", optional(SIGNLETTER)),
  "<<",
  ">>",
  ">>r",
  "<<r",
  ">>s",
  "<<s",
  ">>u",
  "&",
];
const additiveOperators = ["+", "-", "|", "^"];
const comparativeOperators = [
  "==",
  "!=",
  "<",
  "<=",
  ">",
  ">=",
  "<s",
  "<=s",
  ">s",
  ">=s",
  "<u",
  "<=u",
  ">u",
  ">=u",
];

module.exports = grammar({
  name: "jasmin",

  extras: ($) => [$.comment, /\s/],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($._top),

    _top: ($) =>
      choice(
        $.function_definition,
        $.param,
        $.global,
        $.exec,
        $.require,
        $.type_definition,
        $.namespace,
      ),

    type_definition: ($) =>
      seq(
        "type",
        field("alias_name", $.identifier),
        "=",
        field("aliased_type", $._type),
        ";",
      ),

    namespace: ($) =>
      seq(
        "namespace",
        field("name", $.identifier),
        field("code", braces(repeat($._top))),
      ),

    // require ------
    from: ($) => seq("from", field("id", $.identifier)),

    require: ($) =>
      seq(
        optional($.from),
        "require",
        field("file", repeat1($.string_literal)),
      ),
    // ------

    // exec ------
    exec: ($) =>
      seq(
        "exec",
        field("pex_name", alias($.identifier, $.variable)),
        parens_tuple(field("pex_mem", $.range)),
      ),

    range: ($) =>
      seq(field("ptr", $.int_literal), ":", field("size", $.int_literal)),
    // ------

    // global ------
    global: ($) =>
      seq(
        field("type", $._type),
        field("name", alias($.identifier, $.variable)),
        "=",
        field("value", $._gepxr),
        ";",
      ),

    _gepxr: ($) =>
      choice($._expr, seq("{", rtuple1($._expr), "}"), $.string_literal),
    // ------

    // param ------
    param: ($) =>
      seq(
        "param",
        field("type", $._type),
        field("name", alias($.identifier, $.variable)),
        "=",
        field("value", $._expr),
        ";",
      ),
    // ------

    // index expressions ------
    _arr_access: ($) =>
      prec.right(
        seq(
          field("unscaled", optional(".")),
          field("index", brackets($._arr_access_i)),
        ),
      ),

    access_type: ($) => seq(":", $.utype),

    _arr_access_i: ($) =>
      seq(
        field("alignment", optional($.alignment)),
        field("type", optional($.access_type)),
        field("value", $._expr),
        field("len", optional($._arr_access_len)),
      ),

    _arr_access_len: ($) => seq(":", $._expr),

    _mem_acces_address: ($) =>
      seq(
        field("alignment", optional($.alignment)),
        field("type", optional(alias(seq(":", $.utype), $.wsize))),
        field("var", alias($.identifier, $.variable)),
        field("offset", optional($._mem_ofs)),
      ),

    mem_access: ($) => prec(PREC.access, seq("[", $._mem_acces_address, "]")),

    alignment: (_) => choice("#aligned", "#unaligned"),

    _mem_ofs: ($) => choice(seq("+", $._expr), seq("-", $._expr)),

    intrinsic: ($) => seq("#", $.identifier),

    _peop1: ($) =>
      prec(
        PREC.unary,
        choice(seq("!", optional($.castop)), seq("-", optional($.castop))),
      ),

    unary_expr: ($) => prec.left(PREC.unary, seq($._peop1, $._expr)),

    cast_expr: ($) =>
      prec(
        PREC.unary,
        seq(field("cast", parens($._cast)), field("expression", $._expr)),
      ),

    _mult_op: ($) =>
      choice(
        ...multiplicativeOperators.map((operator) =>
          seq(operator, optional($.castop)),
        ),
      ),
    _add_op: ($) =>
      choice(
        ...additiveOperators.map((operator) =>
          seq(operator, optional($.castop)),
        ),
      ),
    _comp_op: ($) =>
      choice(
        ...comparativeOperators.map((operator) =>
          seq(operator, optional($.castop)),
        ),
      ),

    bin_expr: ($) =>
      choice(
        prec.left(
          PREC.and,
          seq(
            field("left", $._expr),
            // @ts-ignore
            field("operator", alias("&&", $.operator)),
            field("right", $._expr),
          ),
        ),
        prec.left(
          PREC.or,
          seq(
            field("left", $._expr),
            // @ts-ignore
            field("operator", alias("||", $.operator)),
            field("right", $._expr),
          ),
        ),
        prec.left(
          PREC.multiplicative,
          seq(
            field("left", $._expr),
            // @ts-ignore
            field("operator", alias($._mult_op, $.operator)),
            field("right", $._expr),
          ),
        ),
        prec.left(
          PREC.additive,
          seq(
            field("left", $._expr),
            // @ts-ignore
            field("operator", alias($._add_op, $.operator)),
            field("right", $._expr),
          ),
        ),
        prec.left(
          PREC.comparative,
          seq(
            field("left", $._expr),
            // @ts-ignore
            field("operator", alias($._comp_op, $.operator)),
            field("right", $._expr),
          ),
        ),
      ),

    ternary_expr: ($) =>
      prec.right(
        PREC.conditional,
        seq(
          field("condition", $._expr),
          "?",
          field("consequence", $._expr),
          ":",
          field("alternative", $._expr),
        ),
      ),

    call_expr: ($) =>
      prec.left(
        PREC.call,
        seq(
          field("function", $.identifier),
          field("args", parens_tuple($._expr)),
        ),
      ),

    intrinsic_expr: ($) =>
      prec.left(
        PREC.call,
        seq(
          field("intrinsic", $.intrinsic),
          field("args", parens_tuple($._expr)),
        ),
      ),

    true: (_) => "true",
    false: (_) => "false",

    parens_expr: ($) => parens($._expr),

    index_expr: ($) =>
      prec(
        PREC.access,
        seq(
          field("operand", alias($.identifier, $.variable)),
          field("index", $._arr_access),
        ),
      ),

    pack_expr: ($) =>
      seq(
        field("ct", parens($.svsize)),
        "[",
        field("es", rtuple1($._expr)),
        "]",
      ),

    _expr: ($) =>
      choice(
        alias($.identifier, $.variable),
        $.index_expr,
        $.true,
        $.false,
        $.int_literal,
        $.mem_access,
        $.pack_expr,
        $.cast_expr,
        $.unary_expr,
        $.bin_expr,
        $.parens_expr,
        $.call_expr,
        $.intrinsic_expr,
        $.ternary_expr,
      ),
    // ------

    // left values ------
    ignore: (_) => token("_"),

    _lvalue: ($) =>
      choice(
        $.ignore,
        alias($.identifier, $.variable),
        $.index_expr,
        $.mem_access,
      ),
    // ------

    // control instructions ------
    block: ($) => braces(repeat($._instr)),

    _instr: ($) => seq(repeat($.annotations), $._instr_r),

    if_statement: ($) =>
      choice(
        seq(
          "if",
          field("condition", $._expr),
          field("consequence", $.block),
          optional(
            seq("else", field("alternative", choice($.if_statement, $.block))),
          ),
        ),
      ),

    assign_op: ($) =>
      choice(
        "=",
        seq("+", field("c", optional($.castop)), "="),
        seq("-", field("c", optional($.castop)), "="),
        seq("*", field("c", optional($.castop)), "="),
        seq("/", field("c", optional($.castop)), "="),
        seq("%", field("c", optional($.castop)), "="),
        seq(">>", field("c", optional($.castop)), "="),
        seq("<<", field("c", optional($.castop)), "="),
        seq(">>r", field("c", optional($.castop)), "="),
        seq("<<r", field("c", optional($.castop)), "="),
        seq("&", field("c", optional($.castop)), "="),
        seq("^", field("c", optional($.castop)), "="),
        seq("|", field("c", optional($.castop)), "="),
      ),

    assign: ($) =>
      prec.right(
        PREC.assignment,
        seq(
          field("left", $.lvalues),
          field("operator", alias($.assign_op, $.operator)),
          field("right", $._expr),
          field("condition", optional(seq("if", $._expr))),
          ";",
        ),
      ),

    array_init: ($) =>
      seq(
        "ArrayInit",
        field("name", parens(alias($.identifier, $.variable))),
        ";",
      ),

    call_instr: ($) =>
      seq(
        field("function", $.identifier),
        field("args", parens_tuple($._expr)),
        field("condition", optional(seq("if", $._expr))),
        ";",
      ),

    for_loop: ($) =>
      seq(
        "for",
        field("loop_var", alias($.identifier, $.variable)),
        "=",
        field("start", $._expr),
        choice("to", "downto"),
        field("end", $._expr),
        field("body", $.block),
      ),

    while_loop: ($) =>
      seq(
        "while",
        field("pre_block", optional($.block)),
        "(",
        field("condition", $._expr),
        ")",
        field("post_block", optional($.block)),
      ),

    _decl_instr: ($) => seq($.var_decl, ";"),

    _instr_r: ($) =>
      choice(
        $.array_init,
        $.assign,
        $.call_instr,
        $.if_statement,
        $.for_loop,
        $.while_loop,
        $._decl_instr,
      ),

    lvalues: ($) =>
      choice(
        tuple1($._lvalue),
        seq("(", ")"),
        $.implicites,
        seq($.implicites, ",", rtuple1($._lvalue)),
      ),

    implicites: ($) => seq("?", braces(commaSep($._annotation))),
    // ------

    // function definitions ------
    _fun_def_start: ($) =>
      seq(
        field("annot", repeat($.annotations)),
        field("call_convention", optional($.call_conv)),
        "fn",
      ),

    function_definition: ($) =>
      seq(
        $._fun_def_start,
        field("name", $.identifier),
        field("args", parens_tuple($.param_decl)),
        field("return_type", optional(seq("->", tuple($._annot_stor_type)))),
        field("body", $.function_body),
      ),

    call_conv: (_) => choice("export", "inline"),

    return_statement: ($) =>
      seq("return", tuple(alias($.identifier, $.variable)), ";"),

    function_body: ($) =>
      choice(braces(seq(repeat($._instr), optional($.return_statement)))),

    param_decl: ($) =>
      seq(
        field("annotations", repeat($.annotations)),
        field(
          "declarations",
          seq(
            field("type", $._stor_type),
            field(
              "variables",
              repeat1(
                choice(
                  field("var", alias($.identifier, $.parameter)),
                  seq(
                    field("var", alias($.identifier, $.parameter)),
                    "=",
                    field("default_value", $._expr),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),

    _writable: (_) => choice("const", "mut"),

    _pointer: ($) => seq(optional($._writable), "ptr"),

    _decl: ($) =>
      choice(
        field("v", alias($.identifier, $.variable)),
        seq(
          field("v", alias($.identifier, $.variable)),
          "=",
          field("e", $._expr),
        ),
      ),

    var_decl: ($) =>
      seq(
        field("type", $._stor_type),
        field("variables", sep1($._decl, optional(","))),
      ),

    storage: ($) =>
      choice(
        seq("reg", optional($._pointer)),
        seq("stack", optional($._pointer)),
        "inline",
        "global",
      ),

    _annot_stor_type: ($) =>
      seq(
        field("annotations", repeat($.annotations)),
        field("storage_type", $._stor_type),
      ),

    _stor_type: ($) => seq(field("storage", $.storage), field("type", $._type)),
    // ------

    // annotations ------
    annotations: ($) =>
      choice(
        seq("#", $._annotation),
        seq("#", brackets(commaSep($._annotation))),
      ),

    _annotation: ($) => seq($._annotation_label, optional($._attribute)),

    _attribute: ($) =>
      choice(
        seq("=", $._simple_attribute),
        seq("=", braces(commaSep($._annotation))),
      ),

    _simple_attribute: ($) =>
      choice($.aint, $._nid, $.string_literal, $.keyword, $.utype),

    aint: ($) => choice($.int_literal, seq("-", $.int_literal)),

    _annotation_label: ($) => choice($.identifier, $.keyword, $.string_literal),

    keyword: (_) => token(choice("inline", "export", "reg", "stack")),
    // ------

    // type expressions ------
    swsize: (_) => token(seq(SIZE, WSIGN)),

    svsize: (_) => token(seq(VSIZE, SIGNLETTER, GENSIZE)),

    utype: (_) => /(s|u)i?(8|16|32|64|128|256)/,

    _cast: ($) => choice($.int_type, $.swsize),

    castop: ($) => choice($.swsize, $.svsize, seq(":", $.utype)),

    array_type: ($) =>
      seq(
        field("type", choice($.utype, $.identifier)),
        brackets(field("len", $._expr)),
      ),

    bool_type: (_) => "bool",
    int_type: (_) => /(t|s)?int/,

    _type: ($) =>
      choice(
        $.bool_type,
        $.int_type,
        $.utype,
        $.array_type,
        alias($.identifier, $.type_alias),
      ),
    // ------

    int_literal: (_) => token(intLiteral),

    escape_sequence: (_) =>
      token(
        prec(
          1,
          seq(
            "\\",
            choice(
              /[^xuU]/,
              /\d{2,3}/,
              /x[0-9a-fA-F]{2,}/,
              /u[0-9a-fA-F]{4}/,
              /U[0-9a-fA-F]{8}/,
            ),
          ),
        ),
      ),

    string_literal: ($) =>
      seq(
        '"',
        repeat(
          choice(
            alias(token.immediate(prec(1, /[^\\"\n]+/)), $.string_content),
            $.escape_sequence,
          ),
        ),
        '"',
      ),

    _nid: (_) => token(/[a-zA-Z_][a-zA-Z0-9_]*/),

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*(::([a-zA-Z_][a-zA-Z0-9_]*))*/,

    comment: (_) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),
  },
});

/**
 * Creates a rule to match one or more occurrences of `rule` separated by `sep`
 *
 * @param {RuleOrLiteral} rule
 *
 * @param {RuleOrLiteral} separator
 *
 * @return {SeqRule}
 *
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {ChoiceRule}
 *
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * Creates a rule to match a rule delimited with parentheses
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function parens(rule) {
  return seq("(", rule, ")");
}

/**
 * Creates a rule to match a rule delimited with brackets
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function brackets(rule) {
  return seq("[", rule, "]");
}

/**
 * Creates a rule to match a rule delimited with braces
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function braces(rule) {
  return seq("{", rule, "}");
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {ChoiceRule}
 *
 */
function rtuple(rule) {
  return commaSep(rule);
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function rtuple1(rule) {
  return commaSep1(rule);
}

/**
 * Creates a rule to match one or more of the rules separated by a comma,
 * eventually delimited by parentheses
 *
 * @param {Rule} rule
 *
 * @return {ChoiceRule}
 *
 */
function tuple1(rule) {
  return choice(parens(rtuple1(rule)), rtuple1(rule));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma,
 * eventually delimited by parentheses
 *
 * @param {Rule} rule
 *
 * @return {ChoiceRule}
 *
 */
function tuple(rule) {
  return choice(parens(rtuple(rule)), rtuple(rule));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma,
 * and delimited by parentheses
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function parens_tuple(rule) {
  return parens(rtuple(rule));
}
