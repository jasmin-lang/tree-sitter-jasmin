examples_dir := "examples"

default:
	@just --list --unsorted

gen: 
	tree-sitter generate

[group("test")]
test-ts: gen
	tree-sitter test

[group("test")]
test-examples: gen
	#! /usr/bin/env bash
	set -euo pipefail
	FILES=$(find "{{examples_dir}}" -iregex '.*\.\(jazz\|japp\|jinc\)$' -type f | tr '\n' ' ')
	tree-sitter parse $FILES -q --stat

[group("test")]
test: test-ts test-examples

[group("test")]
fuzz: gen
	tree-sitter fuzz

parse FILE: gen
	tree-sitter parse {{FILE}}

update-examples:
	#! /usr/bin/env bash
	set -euo pipefail
	JASMIN_LATEST_COMMIT=$(git show jasmin/main --format=%h -s)
	git rm -rf examples
	git read-tree --prefix=examples/ -u jasmin/main:compiler/examples
	git commit -m "update examples to $JASMIN_LATEST_COMMIT"
