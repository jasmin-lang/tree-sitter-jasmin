package tree_sitter_jasmin_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_jasmin "https://github.com/jasmin-lang/jasmin"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_jasmin.Language())
	if language == nil {
		t.Errorf("Error loading Jasmin grammar")
	}
}
