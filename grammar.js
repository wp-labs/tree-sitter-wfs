/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "ws",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($.window_declaration),

    // ── Comments ──
    comment: (_$) => token(seq("//", /.*/)),

    // ── Window declaration ──
    window_declaration: ($) =>
      seq(
        "window",
        field("name", $.identifier),
        "{",
        repeat($.window_attribute),
        $.fields_block,
        "}",
      ),

    // ── Window attributes ──
    window_attribute: ($) =>
      choice($.stream_attribute, $.time_attribute, $.over_attribute),

    stream_attribute: ($) =>
      seq("stream", "=", choice($.string, $.string_array)),

    string_array: ($) =>
      seq("[", $.string, repeat(seq(",", $.string)), "]"),

    time_attribute: ($) => seq("time", "=", $.identifier),

    over_attribute: ($) =>
      seq("over", "=", choice($.duration, "0")),

    // ── Fields block ──
    fields_block: ($) =>
      seq("fields", "{", repeat($.field_declaration), "}"),

    field_declaration: ($) =>
      seq(
        field("name", $.field_name),
        ":",
        field("type", $.field_type),
      ),

    field_name: ($) =>
      choice($.dotted_identifier, $.quoted_identifier, $.identifier),

    dotted_identifier: ($) =>
      seq($.identifier, ".", $.identifier, repeat(seq(".", $.identifier))),

    quoted_identifier: (_$) =>
      token(seq("`", /[^`]+/, "`")),

    // ── Types ──
    field_type: ($) =>
      choice($.array_type, $.base_type),

    array_type: ($) => seq("array", "/", $.base_type),

    base_type: (_$) =>
      choice("chars", "digit", "float", "bool", "time", "ip", "hex"),

    // ── Literals ──
    duration: (_$) => token(/\d+[smhd]/),

    string: (_$) =>
      token(seq('"', repeat(choice(/[^"\\]/, /\\./)), '"')),

    // ── Identifier ──
    identifier: (_$) => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
