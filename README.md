# tree-sitter-jasmin

[![CI]](https://github.com/jasmin-lang/tree-sitter-jasmin/actions/workflows/ci.yml)

<!-- NOTE: uncomment these if you're publishing packages: -->

<!-- [![npm][npm]](https://www.npmjs.com/package/tree-sitter-PARSER_NAME) -->

<!-- [![crates][crates]](https://crates.io/crates/tree-sitter-PARSER_NAME) -->

<!-- [![pypi][pypi]](https://pypi.org/project/tree-sitter-PARSER_NAME/) -->

A Tree-sitter parser for [Jasmin](https://github.com/jasmin-lang/jasmin) files.

## Versioning

This parser does not follow semantic versioning, but instead follows the
versioning scheme of the Jasmin compiler, with a slight twist: the semantic
versioning imposed by the `tree-sitter` CLI doesn't allow minor version numbers
to begin with a zero. This means that version 2025.06.0 of the compiler would
correspond to version 2025.6.0 of this parser.

[ci]: https://img.shields.io/github/actions/workflow/status/jasmin-lang/tree-sitter-jasmin/ci.yml?logo=github&label=CI
