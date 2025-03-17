{
  description = "Treesitter jasmin grammar";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
    };
  };

  outputs = inputs @ {flake-parts, ...}:
    flake-parts.lib.mkFlake {inherit inputs;} {
      imports = [
        inputs.treefmt-nix.flakeModule
      ];
      systems = ["x86_64-linux"];
      perSystem = {
        pkgs,
        config,
        ...
      }: {
        treefmt.config = {
          projectRootFile = "flake.nix";
          programs = {
            alejandra.enable = true;
            statix.enable = true;
            deadnix.enable = true;
            prettier.enable = true;
            mdformat = {
              enable = true;
              settings = {
                wrap = 80;
              };
            };
          };
        };
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            config.treefmt.build.wrapper
            tree-sitter
            nodejs
            python3
            typescript
            typescript-language-server
            just
            graphviz
          ];
        };
      };
    };
}
