examples_dir := "examples"

default:
	@just --list --unsorted

gen: 
	tree-sitter generate

[group("test")]
test: gen
	tree-sitter test


[group("test")]
fuzz: gen
	tree-sitter fuzz

parse FILE: gen
	tree-sitter parse {{FILE}}
