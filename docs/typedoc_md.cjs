module.exports = {
  // Input options
  name: "Arbitrum Orbit SDK",
  entryPoints: ["../src/**/*.ts"],
  entryPointStrategy: "expand",
  exclude: [
    "../src/__snapshots__/**",
    "../src/ethers-compat/**",
    "../src/node_modules",
    "../src/scripts/**",
    "../src/types/NodeConfig.generated.ts",
    "../src/utils/**",
    "../src/types/**",
    "../src/testHelpers.ts",
    "../src/createTokenBridge-testHelpers.ts"
  ],
  excludeNotDocumented: false,
  excludeInternal: true,

  // Plugins
  plugin: ['typedoc-plugin-markdown'],

  // typedoc-plugin-markdown options
  hideBreadcrumbs: true,
  hideInPageTOC: true,
  hideMembersSymbol: true,

  // Output options
  "out": "docs_output_md",

  // Potentially useful for debugging
  // logLevel: "Verbose"
}