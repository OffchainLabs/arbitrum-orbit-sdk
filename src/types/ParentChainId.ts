import { arbitrumOne, arbitrumGoerli, arbitrumSepolia } from '../chains';

export type ParentChainId =
  | typeof arbitrumOne.id
  | typeof arbitrumGoerli.id
  | typeof arbitrumSepolia.id;
