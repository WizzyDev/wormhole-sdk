import { getAssociatedTokenAddress } from '@solana/spl-token';
import {
  ChainAddress,
  ChainContext,
  NativeAddress,
  Network,
  TokenId,
  UniversalOrNative,
} from '@wormhole-foundation/connect-sdk';
import { SolanaAddress } from './address';
import { SolanaChains, SolanaPlatformType } from './types';

export class SolanaChain<
  N extends Network,
  C extends SolanaChains = SolanaChains,
> extends ChainContext<N, SolanaPlatformType, C> {
  override async getTokenAccount(
    address: UniversalOrNative<C>,
    token: TokenId<C>,
  ): Promise<ChainAddress<C>> {
    const mint = token.address.toNative(this.chain).unwrap();
    const owner = new SolanaAddress(address).unwrap();
    const ata = await getAssociatedTokenAddress(mint, owner);
    return {
      chain: this.chain,
      address: new SolanaAddress(ata.toString()) as NativeAddress<C>,
    };
  }
}
