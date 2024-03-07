import { defineConfig } from 'vocs'
 
export default defineConfig({
  description: 'Build reliable apps & libraries with lightweight, \
    composable, and type-safe modules that interface with Ethereum.', 
  title: 'Arbitrum Orbit SDK',
  topNav: [ 
    { text: 'Arbitrum SDK', link: 'https://docs.arbitrum.io/sdk' },
  ],
  sidebar: [
    {
      text: 'Demo',
      link: '/demo',
    },
    { 
      text: 'Orbit SDK', 
      collapsed: false,
      items: [
        {
          text: 'Introduction',
          link: '/orbit-sdk/introduction',
        },
        { 
          text: 'Deployment rollup', 
          link: '/orbit-sdk/deployment-rollup', 
        },
        { 
          text: 'Deployment anytrust', 
          link: '/orbit-sdk/deployment-anytrust', 
        },
        { 
          text: 'Custom gas token', 
          link: '/orbit-sdk/custom-gas-token', 
        },
        { 
          text: 'Node config preparation', 
          link: '/orbit-sdk/node-config-preparation', 
        },
        { 
          text: 'Token bridge deployment', 
          link: '/orbit-sdk/token-bridge-deployment', 
        },
        { 
          text: 'Orbit chain configuration', 
          link: '/orbit-sdk/orbit-chain-configuration', 
        },
      ],
    } 
  ],
})