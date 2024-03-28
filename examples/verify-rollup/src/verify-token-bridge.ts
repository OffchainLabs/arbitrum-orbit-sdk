import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';
import { Bridge__factory } from '@arbitrum/sdk/dist/lib/abi/factories/Bridge__factory';
import { L2GatewayRouter__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2GatewayRouter__factory';
import { L1ERC20Gateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L1ERC20Gateway__factory';
import { L2ERC20Gateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2ERC20Gateway__factory';
import { L2CustomGateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2CustomGateway__factory';
import { L2WethGateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2WethGateway__factory';
import { AeWETH__factory } from '@arbitrum/sdk/dist/lib/abi/factories/AeWETH__factory';
import { TokenBridgeCreatorAbi } from './lib/abis';
import { OrbitHandler } from './lib/client';
import { Abi } from './lib/types';
import 'dotenv/config';
import {
  UpgradeExecutorRoles,
  contractIsInitialized,
  getCurrentAdminOfContract,
  getLogicAddressOfContract,
  getTokenBridgeAddresses,
  getTokenBridgeCanonicalOrbitAddresses,
  getTokenBridgeCustomGatewayInitializedAddresses,
  getTokenBridgeOrbitCustomGatewayInitializedAddresses,
  getTokenBridgeOrbitRouterInitializedAddresses,
  getTokenBridgeOrbitStandardGatewayInitializedAddresses,
  getTokenBridgeOrbitWethGatewayInitializedAddresses,
  getTokenBridgeRouterInitializedAddresses,
  getTokenBridgeStandardGatewayInitializedAddresses,
  getTokenBridgeWethGatewayInitializedAddresses,
  getUpgradeExecutorPrivilegedAccounts,
} from './lib/utils';
import { zeroAddress } from 'viem';
import { Ownable__factory } from '@arbitrum/sdk/dist/lib/abi/factories/Ownable__factory';

if (
  !process.env.PARENT_CHAIN_ID ||
  !process.env.ROLLUP_ADDRESS ||
  !process.env.PARENT_CHAIN_TOKEN_BRIDGE_CREATOR
) {
  throw new Error(
    `The following environmental variables are required: ORBIT_CHAIN_ID, ORBIT_CHAIN_RPC, PARENT_CHAIN_ID, ROLLUP_ADDRESS, PARENT_CHAIN_TOKEN_BRIDGE_CREATOR`,
  );
}

// Get the orbit handler
const orbitHandler = new OrbitHandler(
  Number(process.env.PARENT_CHAIN_ID),
  process.env.ORBIT_CHAIN_ID ? Number(process.env.ORBIT_CHAIN_ID) : undefined,
  process.env.ORBIT_CHAIN_RPC ?? undefined,
);

const main = async () => {
  //
  // Initialization
  //
  const warningMessages: string[] = [];
  const orbitChainId = Number(process.env.ORBIT_CHAIN_ID);
  const rollupAddress = process.env.ROLLUP_ADDRESS as `0x${string}`;
  const tokenBridgeCreatorAddress = process.env.PARENT_CHAIN_TOKEN_BRIDGE_CREATOR as `0x${string}`;

  // Get Retryable Sender
  const parentChainRetryableSender = (await orbitHandler.readContract(
    'parent',
    tokenBridgeCreatorAddress,
    TokenBridgeCreatorAbi as Abi,
    'retryableSender',
  )) as `0x${string}`;
  console.log(`Retryable sender is ${parentChainRetryableSender}`);

  //
  // Get Token Bridge contracts
  //
  console.log('Token Bridge addresses');
  console.log('--------------');
  const [inboxAddress, bridgeAddress] = await Promise.all(
    ['inbox', 'bridge'].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        'parent',
        rollupAddress,
        RollupCore__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );
  let isUsingFeeToken = false;
  try {
    await orbitHandler.readContract(
      'parent',
      bridgeAddress,
      Bridge__factory.abi as Abi,
      'nativeToken',
    );
    isUsingFeeToken = true;
  } catch (err) {
    // Silently continue
  }

  const tokenBridgeAddresses = await getTokenBridgeAddresses(
    orbitHandler,
    'parent',
    tokenBridgeCreatorAddress,
    inboxAddress,
  );
  console.log(`Parent chain:`, tokenBridgeAddresses);

  const canonicalOrbitAddresses = await getTokenBridgeCanonicalOrbitAddresses(
    orbitHandler,
    'parent',
    tokenBridgeCreatorAddress,
    orbitChainId,
    isUsingFeeToken,
  );
  console.log(`Orbit chain:`, canonicalOrbitAddresses);

  //
  // Verify canonical addresses for parent chain
  //
  const canonicalParentChainRouterAddress = (await orbitHandler.readContract(
    'parent',
    tokenBridgeCreatorAddress,
    TokenBridgeCreatorAbi as Abi,
    'getCanonicalL1RouterAddress',
    [inboxAddress],
  )) as `0x${string}`;
  if (canonicalParentChainRouterAddress != tokenBridgeAddresses.router) {
    warningMessages.push(
      `Canonical router address ${canonicalParentChainRouterAddress} is different than the TokenBridge router ${tokenBridgeAddresses.router}`,
    );
  }

  //
  // Verify Router initialization
  //
  const routerInitializedAddresses = await getTokenBridgeRouterInitializedAddresses(
    orbitHandler,
    'parent',
    tokenBridgeAddresses.router,
  );
  if (routerInitializedAddresses.defaultGateway != tokenBridgeAddresses.standardGateway) {
    warningMessages.push(
      `Router's default gateway ${routerInitializedAddresses.defaultGateway} is different than the TokenBridge standard gateway ${tokenBridgeAddresses.standardGateway}`,
    );
  }
  if (routerInitializedAddresses.inbox != tokenBridgeAddresses.inbox) {
    warningMessages.push(
      `Router's inbox ${routerInitializedAddresses.inbox} is different than the TokenBridge inbox ${tokenBridgeAddresses.inbox}`,
    );
  }
  if (routerInitializedAddresses.router != zeroAddress) {
    warningMessages.push(
      `Router's default router ${routerInitializedAddresses.router} is not the zero address`,
    );
  }
  if (routerInitializedAddresses.counterpartGateway != canonicalOrbitAddresses.router) {
    warningMessages.push(
      `Router's counterpart router ${routerInitializedAddresses.counterpartGateway} is different than the Orbit TokenBridge router ${canonicalOrbitAddresses.router}`,
    );
  }

  //
  // Verify StandardGateway initialization
  //
  const standardGatewayInitializedAddresses =
    await getTokenBridgeStandardGatewayInitializedAddresses(
      orbitHandler,
      'parent',
      tokenBridgeAddresses.standardGateway,
    );
  if (
    standardGatewayInitializedAddresses.counterpartGateway !=
    canonicalOrbitAddresses.standardGateway
  ) {
    warningMessages.push(
      `StandardGateway's counterpart gateway ${standardGatewayInitializedAddresses.counterpartGateway} is different than the Orbit TokenBridge standard gateway ${canonicalOrbitAddresses.standardGateway}`,
    );
  }
  if (standardGatewayInitializedAddresses.router != tokenBridgeAddresses.router) {
    warningMessages.push(
      `StandardGateway's router ${standardGatewayInitializedAddresses.router} is different than the TokenBridge router ${tokenBridgeAddresses.router}`,
    );
  }
  if (standardGatewayInitializedAddresses.inbox != tokenBridgeAddresses.inbox) {
    warningMessages.push(
      `StandardGateway's inbox ${standardGatewayInitializedAddresses.inbox} is different than the TokenBridge inbox ${tokenBridgeAddresses.inbox}`,
    );
  }
  if (
    standardGatewayInitializedAddresses.orbitBeaconProxyFactory !=
    canonicalOrbitAddresses.beaconProxyFactory
  ) {
    warningMessages.push(
      `StandardGateway's beaconProxyFactory ${standardGatewayInitializedAddresses.orbitBeaconProxyFactory} is different than the Orbit TokenBridge beaconProxyFactory ${canonicalOrbitAddresses.beaconProxyFactory}`,
    );
  }
  if (standardGatewayInitializedAddresses.whitelist != zeroAddress) {
    warningMessages.push(
      `StandardGateway's whitelist ${standardGatewayInitializedAddresses.whitelist} is different than the zero address`,
    );
  }

  if (orbitHandler.handlesOrbitChain()) {
    const orbitStandardCounterpartGatewayAddress = (await orbitHandler.readContract(
      'parent',
      tokenBridgeAddresses.standardGateway,
      L1ERC20Gateway__factory.abi as Abi,
      'counterpartGateway',
    )) as `0x${string}`;
    const orbitBeaconProxyFactoryFromOrbitGateway = (await orbitHandler.readContract(
      'orbit',
      orbitStandardCounterpartGatewayAddress,
      L2ERC20Gateway__factory.abi as Abi,
      'beaconProxyFactory',
    )) as `0x${string}`;
    if (
      standardGatewayInitializedAddresses.orbitBeaconProxyFactory !=
      orbitBeaconProxyFactoryFromOrbitGateway
    ) {
      warningMessages.push(
        `StandardGateway's beaconProxyFactory ${standardGatewayInitializedAddresses.orbitBeaconProxyFactory} is different than the Orbit TokenBridge standard gateway's beaconProxyFactory ${orbitBeaconProxyFactoryFromOrbitGateway}`,
      );
    }

    const orbitCloneableProxyHashFromOrbitGateway = (await orbitHandler.readContract(
      'orbit',
      orbitStandardCounterpartGatewayAddress,
      L2ERC20Gateway__factory.abi as Abi,
      'cloneableProxyHash',
    )) as `0x${string}`;
    if (
      standardGatewayInitializedAddresses.cloneableProxyHash !=
      orbitCloneableProxyHashFromOrbitGateway
    ) {
      warningMessages.push(
        `StandardGateway's cloneableProxyHash ${standardGatewayInitializedAddresses.cloneableProxyHash} is different than the Orbit TokenBridge standard gateway's cloneableProxyHash ${orbitCloneableProxyHashFromOrbitGateway}`,
      );
    }
  }

  //
  // Verify CustomGateway initialization
  //
  const customGatewayInitializedAddresses = await getTokenBridgeCustomGatewayInitializedAddresses(
    orbitHandler,
    'parent',
    tokenBridgeAddresses.customGateway,
  );
  if (
    customGatewayInitializedAddresses.counterpartGateway != canonicalOrbitAddresses.customGateway
  ) {
    warningMessages.push(
      `CustomGateway's counterpart gateway ${customGatewayInitializedAddresses.counterpartGateway} is different than the Orbit TokenBridge custom gateway ${canonicalOrbitAddresses.customGateway}`,
    );
  }
  if (customGatewayInitializedAddresses.router != tokenBridgeAddresses.router) {
    warningMessages.push(
      `CustomGateway's router ${customGatewayInitializedAddresses.router} is different than the TokenBridge router ${tokenBridgeAddresses.router}`,
    );
  }
  if (customGatewayInitializedAddresses.inbox != tokenBridgeAddresses.inbox) {
    warningMessages.push(
      `CustomGateway's inbox ${customGatewayInitializedAddresses.inbox} is different than the TokenBridge inbox ${tokenBridgeAddresses.inbox}`,
    );
  }
  if (customGatewayInitializedAddresses.whitelist != zeroAddress) {
    warningMessages.push(
      `CustomGateway's whitelist ${customGatewayInitializedAddresses.whitelist} is different than the zero address`,
    );
  }

  //
  // Verify Weth initialization
  //
  if (!isUsingFeeToken) {
    const wethGatewayInitializedAddresses = await getTokenBridgeWethGatewayInitializedAddresses(
      orbitHandler,
      'parent',
      tokenBridgeAddresses.wethGateway,
    );
    if (wethGatewayInitializedAddresses.counterpartGateway != canonicalOrbitAddresses.wethGateway) {
      warningMessages.push(
        `WethGateway's counterpart gateway ${wethGatewayInitializedAddresses.counterpartGateway} is different than the Orbit TokenBridge weth gateway ${canonicalOrbitAddresses.wethGateway}`,
      );
    }
    if (wethGatewayInitializedAddresses.router != tokenBridgeAddresses.router) {
      warningMessages.push(
        `WethGateway's router ${wethGatewayInitializedAddresses.router} is different than the TokenBridge router ${tokenBridgeAddresses.router}`,
      );
    }
    if (wethGatewayInitializedAddresses.inbox != tokenBridgeAddresses.inbox) {
      warningMessages.push(
        `WethGateway's inbox ${wethGatewayInitializedAddresses.inbox} is different than the TokenBridge inbox ${tokenBridgeAddresses.inbox}`,
      );
    }
    if (wethGatewayInitializedAddresses.parentChainWeth == zeroAddress) {
      warningMessages.push(
        `WethGateway's L1 Weth ${wethGatewayInitializedAddresses.parentChainWeth} is the zero address`,
      );
    }
    if (wethGatewayInitializedAddresses.orbitChainWeth == zeroAddress) {
      warningMessages.push(
        `WethGateway's L2 Weth ${wethGatewayInitializedAddresses.orbitChainWeth} is the zero address`,
      );
    }
  }

  if (orbitHandler.handlesOrbitChain()) {
    //
    // Verify Orbit Router initialization
    //
    const orbitRouterInitializedAddresses = await getTokenBridgeOrbitRouterInitializedAddresses(
      orbitHandler,
      'orbit',
      canonicalOrbitAddresses.router,
    );
    if (orbitRouterInitializedAddresses.defaultGateway != canonicalOrbitAddresses.standardGateway) {
      warningMessages.push(
        `Orbit router's default gateway ${orbitRouterInitializedAddresses.defaultGateway} is different than the Orbit TokenBridge standard gateway ${tokenBridgeAddresses.standardGateway}`,
      );
    }
    if (orbitRouterInitializedAddresses.router != zeroAddress) {
      warningMessages.push(
        `Orbit Router's default router ${orbitRouterInitializedAddresses.router} is not the zero address`,
      );
    }
    if (orbitRouterInitializedAddresses.counterpartGateway != tokenBridgeAddresses.router) {
      warningMessages.push(
        `Orbit Router's counterpart router ${orbitRouterInitializedAddresses.counterpartGateway} is different than the TokenBridge router ${tokenBridgeAddresses.router}`,
      );
    }

    //
    // Verify StandardGateway initialization
    //
    const orbitStandardGatewayInitializedAddresses =
      await getTokenBridgeOrbitStandardGatewayInitializedAddresses(
        orbitHandler,
        'orbit',
        canonicalOrbitAddresses.standardGateway,
      );
    if (
      orbitStandardGatewayInitializedAddresses.counterpartGateway !=
      tokenBridgeAddresses.standardGateway
    ) {
      warningMessages.push(
        `Orbit standardGateway's counterpart gateway ${orbitStandardGatewayInitializedAddresses.counterpartGateway} is different than the TokenBridge standard gateway ${tokenBridgeAddresses.standardGateway}`,
      );
    }
    if (orbitStandardGatewayInitializedAddresses.router != canonicalOrbitAddresses.router) {
      warningMessages.push(
        `Orbit standardGateway's router ${orbitStandardGatewayInitializedAddresses.router} is different than the Orbit TokenBridge router ${canonicalOrbitAddresses.router}`,
      );
    }

    const standardCounterpartGatewayAddress = (await orbitHandler.readContract(
      'orbit',
      canonicalOrbitAddresses.standardGateway,
      L2ERC20Gateway__factory.abi as Abi,
      'counterpartGateway',
    )) as `0x${string}`;
    const orbitBeaconProxyFactoryFromParentChainGateway = (await orbitHandler.readContract(
      'parent',
      standardCounterpartGatewayAddress,
      L1ERC20Gateway__factory.abi as Abi,
      'l2BeaconProxyFactory',
    )) as `0x${string}`;
    if (
      orbitStandardGatewayInitializedAddresses.beaconProxyFactory !=
      orbitBeaconProxyFactoryFromParentChainGateway
    ) {
      warningMessages.push(
        `Orbit standardGateway's beaconProxyFactory ${orbitStandardGatewayInitializedAddresses.beaconProxyFactory} is different than the TokenBridge standard gateway's l2BeaconProxyFactory ${orbitBeaconProxyFactoryFromParentChainGateway}`,
      );
    }

    const orbitCloneableProxyHashFromOrbitGateway = (await orbitHandler.readContract(
      'parent',
      standardCounterpartGatewayAddress,
      L1ERC20Gateway__factory.abi as Abi,
      'cloneableProxyHash',
    )) as `0x${string}`;
    if (
      orbitStandardGatewayInitializedAddresses.cloneableProxyHash !=
      orbitCloneableProxyHashFromOrbitGateway
    ) {
      warningMessages.push(
        `Orbit standardGateway's cloneableProxyHash ${orbitStandardGatewayInitializedAddresses.cloneableProxyHash} is different than the TokenBridge standard gateway's cloneableProxyHash ${orbitCloneableProxyHashFromOrbitGateway}`,
      );
    }

    //
    // Verify CustomGateway initialization
    //
    const orbitCustomGatewayInitializedAddresses =
      await getTokenBridgeOrbitCustomGatewayInitializedAddresses(
        orbitHandler,
        'orbit',
        canonicalOrbitAddresses.customGateway,
      );
    if (
      orbitCustomGatewayInitializedAddresses.counterpartGateway !=
      tokenBridgeAddresses.customGateway
    ) {
      warningMessages.push(
        `Orbit customGateway's counterpart gateway ${orbitCustomGatewayInitializedAddresses.counterpartGateway} is different than the TokenBridge custom gateway ${tokenBridgeAddresses.customGateway}`,
      );
    }
    if (orbitCustomGatewayInitializedAddresses.router != canonicalOrbitAddresses.router) {
      warningMessages.push(
        `Orbit customGateway's router ${orbitCustomGatewayInitializedAddresses.router} is different than the Orbit TokenBridge router ${canonicalOrbitAddresses.router}`,
      );
    }

    //
    // Verify Weth initialization
    //
    if (!isUsingFeeToken) {
      const orbitWethGatewayInitializedAddresses =
        await getTokenBridgeOrbitWethGatewayInitializedAddresses(
          orbitHandler,
          'orbit',
          canonicalOrbitAddresses.wethGateway,
        );
      if (
        orbitWethGatewayInitializedAddresses.counterpartGateway != tokenBridgeAddresses.wethGateway
      ) {
        warningMessages.push(
          `Orbit wethGateway's counterpart gateway ${orbitWethGatewayInitializedAddresses.counterpartGateway} is different than the TokenBridge weth gateway ${tokenBridgeAddresses.wethGateway}`,
        );
      }
      if (orbitWethGatewayInitializedAddresses.router != canonicalOrbitAddresses.router) {
        warningMessages.push(
          `Orbit wethGateway's router ${orbitWethGatewayInitializedAddresses.router} is different than the Orbit TokenBridge router ${canonicalOrbitAddresses.router}`,
        );
      }
      if (orbitWethGatewayInitializedAddresses.parentChainWeth == zeroAddress) {
        warningMessages.push(
          `Orbit wethGateway's L1 Weth ${orbitWethGatewayInitializedAddresses.parentChainWeth} is the zero address`,
        );
      }
      if (orbitWethGatewayInitializedAddresses.orbitChainWeth == zeroAddress) {
        warningMessages.push(
          `Orbit wethGateway's L2 Weth ${orbitWethGatewayInitializedAddresses.orbitChainWeth} is the zero address`,
        );
      }
    }

    //
    // Verify Multicall
    //
    const multicallContractBytecode = await orbitHandler.getBytecode(
      'orbit',
      canonicalOrbitAddresses.multicall,
    );
    if (!multicallContractBytecode) {
      warningMessages.push(
        `Orbit Multicall is not present at ${canonicalOrbitAddresses.multicall}`,
      );
    }
  }

  // Verify TokenBridge warning messages
  if (warningMessages.length <= 0) {
    console.log(`All TokenBridge contracts are set correctly`);
  }
  console.log('');

  //
  // Verify Ownership
  //
  console.log('TokenBridge contracts owners/admins (Parent chain)');
  console.log('--------------');
  const [routerAdmin, standardGatewayAdmin, customGatewayAdmin] = await Promise.all(
    [
      tokenBridgeAddresses.router,
      tokenBridgeAddresses.standardGateway,
      tokenBridgeAddresses.customGateway,
    ].map(async (contractAddress) => {
      const address = (await getCurrentAdminOfContract(
        orbitHandler,
        'parent',
        contractAddress,
      )) as `0x${string}`;
      return address;
    }),
  );

  console.log(
    `Router admin: ${routerAdmin} (${
      routerAdmin == tokenBridgeAddresses.proxyAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin'
    })`,
  );
  console.log(
    `StandardGateway admin: ${standardGatewayAdmin} (${
      standardGatewayAdmin == tokenBridgeAddresses.proxyAdmin
        ? 'Is ProxyAdmin'
        : 'Is NOT ProxyAdmin'
    })`,
  );
  console.log(
    `CustomGateway admin: ${customGatewayAdmin} (${
      customGatewayAdmin == tokenBridgeAddresses.proxyAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin'
    })`,
  );
  if (routerAdmin != tokenBridgeAddresses.proxyAdmin) {
    warningMessages.push(`TokenBridge router admin is not the ProxyAdmin`);
  }
  if (standardGatewayAdmin != tokenBridgeAddresses.proxyAdmin) {
    warningMessages.push(`TokenBridge StandardGateway admin is not the ProxyAdmin`);
  }
  if (customGatewayAdmin != tokenBridgeAddresses.proxyAdmin) {
    warningMessages.push(`TokenBridge CustomGateway admin is not the ProxyAdmin`);
  }
  if (!isUsingFeeToken) {
    const wethGatewayAdmin = (await getCurrentAdminOfContract(
      orbitHandler,
      'parent',
      tokenBridgeAddresses.wethGateway,
    )) as `0x${string}`;
    console.log(
      `WethGateway admin: ${wethGatewayAdmin} (${
        wethGatewayAdmin == tokenBridgeAddresses.proxyAdmin ? 'Is ProxyAdmin' : 'Is NOT ProxyAdmin'
      })`,
    );
    if (wethGatewayAdmin != tokenBridgeAddresses.proxyAdmin) {
      warningMessages.push(`TokenBridge WethGateway admin is not the ProxyAdmin`);
    }
  }

  const [routerOwner, customGatewayOwner, proxyAdminOwner] = await Promise.all(
    [
      tokenBridgeAddresses.router,
      tokenBridgeAddresses.customGateway,
      tokenBridgeAddresses.proxyAdmin,
    ].map(async (contractAddress) => {
      const address = (await orbitHandler.readContract(
        'parent',
        contractAddress,
        Ownable__factory.abi as Abi,
        'owner',
      )) as `0x${string}`;
      return address;
    }),
  );

  console.log(
    `Router owner: ${routerOwner} (${
      routerOwner == tokenBridgeAddresses.upgradeExecutor
        ? 'Is UpgradeExecutor'
        : 'Is NOT UpgradeExecutor'
    })`,
  );
  console.log(
    `CustomGateway owner: ${customGatewayOwner} (${
      customGatewayOwner == tokenBridgeAddresses.upgradeExecutor
        ? 'Is UpgradeExecutor'
        : 'Is NOT UpgradeExecutor'
    })`,
  );
  console.log(
    `ProxyAdmin owner: ${proxyAdminOwner} (${
      proxyAdminOwner == tokenBridgeAddresses.upgradeExecutor
        ? 'Is UpgradeExecutor'
        : 'Is NOT UpgradeExecutor'
    })`,
  );
  if (routerOwner != tokenBridgeAddresses.upgradeExecutor) {
    warningMessages.push(`TokenBridge router owner is not the UpgradeExecutor`);
  }
  if (customGatewayOwner != tokenBridgeAddresses.upgradeExecutor) {
    warningMessages.push(`TokenBridge CustomGateway owner is not the UpgradeExecutor`);
  }
  if (proxyAdminOwner != tokenBridgeAddresses.upgradeExecutor) {
    warningMessages.push(`TokenBridge ProxyAdmin owner is not the UpgradeExecutor`);
  }
  console.log('');

  if (orbitHandler.handlesOrbitChain()) {
    console.log('TokenBridge contracts owners/admins (Orbit chain)');
    console.log('--------------');
    const [orbitRouterAdmin, orbitStandardGatewayAdmin, orbitCustomGatewayAdmin] =
      await Promise.all(
        [
          canonicalOrbitAddresses.router,
          canonicalOrbitAddresses.standardGateway,
          canonicalOrbitAddresses.customGateway,
        ].map(async (contractAddress) => {
          const address = (await getCurrentAdminOfContract(
            orbitHandler,
            'orbit',
            contractAddress,
          )) as `0x${string}`;
          return address;
        }),
      );

    console.log(
      `Orbit router admin: ${orbitRouterAdmin} (${
        orbitRouterAdmin == canonicalOrbitAddresses.proxyAdmin
          ? 'Is ProxyAdmin'
          : 'Is NOT ProxyAdmin'
      })`,
    );
    console.log(
      `Orbit standardGateway admin: ${orbitStandardGatewayAdmin} (${
        orbitStandardGatewayAdmin == canonicalOrbitAddresses.proxyAdmin
          ? 'Is ProxyAdmin'
          : 'Is NOT ProxyAdmin'
      })`,
    );
    console.log(
      `Orbit customGateway admin: ${orbitCustomGatewayAdmin} (${
        orbitCustomGatewayAdmin == canonicalOrbitAddresses.proxyAdmin
          ? 'Is ProxyAdmin'
          : 'Is NOT ProxyAdmin'
      })`,
    );
    if (orbitRouterAdmin != canonicalOrbitAddresses.proxyAdmin) {
      warningMessages.push(`Orbit Router admin is not the ProxyAdmin`);
    }
    if (orbitStandardGatewayAdmin != canonicalOrbitAddresses.proxyAdmin) {
      warningMessages.push(`Orbit StandardGateway admin is not the ProxyAdmin`);
    }
    if (orbitCustomGatewayAdmin != canonicalOrbitAddresses.proxyAdmin) {
      warningMessages.push(`Orbit CustomGateway admin is not the ProxyAdmin`);
    }
    if (!isUsingFeeToken) {
      const orbitWethGatewayAdmin = (await getCurrentAdminOfContract(
        orbitHandler,
        'orbit',
        canonicalOrbitAddresses.wethGateway,
      )) as `0x${string}`;
      console.log(
        `Orbit WethGateway admin: ${orbitWethGatewayAdmin} (${
          orbitWethGatewayAdmin == canonicalOrbitAddresses.proxyAdmin
            ? 'Is ProxyAdmin'
            : 'Is NOT ProxyAdmin'
        }`,
      );
      if (orbitWethGatewayAdmin != canonicalOrbitAddresses.proxyAdmin) {
        warningMessages.push(`Orbit WethGateway admin is not the ProxyAdmin`);
      }
    }

    const orbitProxyAdminOwner = (await orbitHandler.readContract(
      'orbit',
      canonicalOrbitAddresses.proxyAdmin,
      Ownable__factory.abi as Abi,
      'owner',
    )) as `0x${string}`;
    console.log(
      `Orbit ProxyAdmin owner: ${orbitProxyAdminOwner} (${
        orbitProxyAdminOwner == canonicalOrbitAddresses.upgradeExecutor
          ? 'Is UpgradeExecutor'
          : 'Is NOT UpgradeExecutor'
      })`,
    );
    if (orbitProxyAdminOwner != canonicalOrbitAddresses.upgradeExecutor) {
      warningMessages.push(`Orbit ProxyAdmin owner is not the UpgradeExecutor`);
    }

    console.log('');
  }

  //
  // Verify UpgradeExecutor initialization
  //
  console.log('UpgradeExecutor privileged accounts (Parent chain)');
  console.log('--------------');
  const upgradeExecutorPrivilegedAccounts = await getUpgradeExecutorPrivilegedAccounts(
    orbitHandler,
    'parent',
    tokenBridgeAddresses.upgradeExecutor,
  );
  if (!upgradeExecutorPrivilegedAccounts) {
    console.log(`No privileged accounts found in the TokenBridge UpgradeExecutor contract`);
  } else {
    Object.keys(upgradeExecutorPrivilegedAccounts).forEach((privilegedAccount) => {
      const accountRoles = upgradeExecutorPrivilegedAccounts[
        privilegedAccount as `0x${string}`
      ].map((role) => {
        if (role in UpgradeExecutorRoles) {
          return UpgradeExecutorRoles[role];
        } else {
          return role;
        }
      });

      console.log(`${privilegedAccount}: ${accountRoles.join(',')}`);
    });
  }
  console.log('');

  if (orbitHandler.handlesOrbitChain()) {
    console.log('UpgradeExecutor privileged accounts (Orbit chain)');
    console.log('--------------');
    const upgradeExecutorPrivilegedAccounts = await getUpgradeExecutorPrivilegedAccounts(
      orbitHandler,
      'orbit',
      canonicalOrbitAddresses.upgradeExecutor,
    );
    if (!upgradeExecutorPrivilegedAccounts) {
      console.log(`No privileged accounts found in the Orbit UpgradeExecutor contract`);
    } else {
      Object.keys(upgradeExecutorPrivilegedAccounts).forEach((privilegedAccount) => {
        const accountRoles = upgradeExecutorPrivilegedAccounts[
          privilegedAccount as `0x${string}`
        ].map((role) => {
          if (role in UpgradeExecutorRoles) {
            return UpgradeExecutorRoles[role];
          } else {
            return role;
          }
        });

        console.log(`${privilegedAccount}: ${accountRoles.join(',')}`);
      });
    }
    console.log('');
  }

  //
  // Verify logic contract addresses on Orbit chain
  //
  if (orbitHandler.handlesOrbitChain()) {
    const upgradeExecutorLogic = await getLogicAddressOfContract(
      orbitHandler,
      'orbit',
      canonicalOrbitAddresses.upgradeExecutor,
    );
    if (!upgradeExecutorLogic) {
      warningMessages.push(`UpgradeExecutor logic contract not found`);
    } else {
      const upgradeExecutorIsInitialized = await contractIsInitialized(
        orbitHandler,
        'orbit',
        upgradeExecutorLogic,
      );
      if (!upgradeExecutorIsInitialized) {
        warningMessages.push(`UpgradeExecutor logic contract is not initialized`);
      }
    }

    const [routerLogic, standardGatewayLogic, customGatewayLogic] = await Promise.all(
      [
        canonicalOrbitAddresses.router,
        canonicalOrbitAddresses.standardGateway,
        canonicalOrbitAddresses.customGateway,
      ].map(async (contractAddress) => {
        const address = (await getLogicAddressOfContract(
          orbitHandler,
          'orbit',
          contractAddress,
        )) as `0x${string}`;
        return address;
      }),
    );
    const routerLogicCounterpartAddress = (await orbitHandler.readContract(
      'orbit',
      routerLogic,
      L2GatewayRouter__factory.abi as Abi,
      'counterpartGateway',
    )) as `0x${string}`;
    if (routerLogicCounterpartAddress == zeroAddress) {
      warningMessages.push(`Counterpart address of the logic Router contract is the zero address`);
    }
    const standardGatewayLogicCounterpartAddress = (await orbitHandler.readContract(
      'orbit',
      standardGatewayLogic,
      L2ERC20Gateway__factory.abi as Abi,
      'counterpartGateway',
    )) as `0x${string}`;
    if (standardGatewayLogicCounterpartAddress == zeroAddress) {
      warningMessages.push(
        `Counterpart address of the logic StandardGateway contract is the zero address`,
      );
    }
    const customGatewayLogicCounterpartAddress = (await orbitHandler.readContract(
      'orbit',
      customGatewayLogic,
      L2CustomGateway__factory.abi as Abi,
      'counterpartGateway',
    )) as `0x${string}`;
    if (customGatewayLogicCounterpartAddress == zeroAddress) {
      warningMessages.push(
        `Counterpart address of the logic CustomGateway contract is the zero address`,
      );
    }

    if (!isUsingFeeToken) {
      const [wethGatewayLogic, wethLogic] = await Promise.all(
        [canonicalOrbitAddresses.wethGateway, canonicalOrbitAddresses.weth].map(
          async (contractAddress) => {
            const address = (await getLogicAddressOfContract(
              orbitHandler,
              'orbit',
              contractAddress,
            )) as `0x${string}`;
            return address;
          },
        ),
      );
      const wethGatewayLogicCounterpartAddress = (await orbitHandler.readContract(
        'orbit',
        wethGatewayLogic,
        L2WethGateway__factory.abi as Abi,
        'counterpartGateway',
      )) as `0x${string}`;
      if (wethGatewayLogicCounterpartAddress == zeroAddress) {
        warningMessages.push(
          `Counterpart address of the logic WethGateway contract is the zero address`,
        );
      }
      const wethLogicCounterpartAddress = (await orbitHandler.readContract(
        'orbit',
        wethLogic,
        AeWETH__factory.abi as Abi,
        'l2Gateway',
      )) as `0x${string}`;
      if (wethLogicCounterpartAddress == zeroAddress) {
        warningMessages.push(`Counterpart address of the logic WETH contract is the zero address`);
      }
    }
  }

  console.log(`*****************`);
  console.log(`Warning messages:`);
  console.log(`*****************`);
  if (warningMessages.length > 0) {
    console.log(warningMessages.join('\n'));
  } else {
    console.log(`No messages`);
  }
};

// Calling main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
