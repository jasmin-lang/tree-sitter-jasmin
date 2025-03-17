// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterJasmin",
    products: [
        .library(name: "TreeSitterJasmin", targets: ["TreeSitterJasmin"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterJasmin",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterJasminTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterJasmin",
            ],
            path: "bindings/swift/TreeSitterJasminTests"
        )
    ],
    cLanguageStandard: .c11
)
