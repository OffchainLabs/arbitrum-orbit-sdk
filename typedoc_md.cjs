module.exports = {
  // Input options
  name: "Arbitrum Orbit SDK",
  entryPoints: ["./src/**/*.ts"],
  entryPointStrategy: "expand",
  exclude: [
    "./src/__snapshots__/**",
    "./src/ethers-compat/**",
    "./src/node_modules",
    "./src/scripts/**",
    "./src/types/NodeConfig.generated.ts",
    "./src/utils/**",
    "./src/types/**",
    "./src/generated.ts",
    "./src/testHelpers.ts",
    "./src/createTokenBridge-testHelpers.ts"
  ],
  excludeNotDocumented: false,
  excludeInternal: false,

  // Plugins
  plugin: ['typedoc-plugin-markdown'],

  // typedoc-plugin-markdown options
  hideBreadcrumbs: true,
  hideInPageTOC: true,
  hideMembersSymbol: true,

  // Potentially useful for debugging
  // logLevel: "Verbose"
}