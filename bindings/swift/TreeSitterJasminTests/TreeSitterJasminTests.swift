import XCTest
import SwiftTreeSitter
import TreeSitterJasmin

final class TreeSitterJasminTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_jasmin())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Jasmin grammar")
    }
}
