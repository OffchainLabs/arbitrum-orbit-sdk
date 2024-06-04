import { it } from 'vitest';
import { Chain, Client, PublicClient, Transport, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

function acceptPublicClient<TChain extends Chain | undefined = Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  // noop
}

it('asdf', () => {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });

  acceptPublicClient(client);
});
