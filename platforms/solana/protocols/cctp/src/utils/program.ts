import { Connection, PublicKey, PublicKeyInitData } from '@solana/web3.js';
import { Program, Provider } from '@project-serum/anchor';

import { utils } from '@wormhole-foundation/connect-sdk-solana';
import { idl } from '../index';
import { TokenMessenger } from '../tokenMessenger';
import { MessageTransmitter } from '../messageTransmitter';

export function createTokenMessengerProgramInterface(
  programId: PublicKeyInitData,
  provider?: Provider,
): Program<TokenMessenger> {
  return new Program<TokenMessenger>(
    idl.TokenMessengerIdl as TokenMessenger,
    new PublicKey(programId),
    provider === undefined ? ({ connection: null } as any) : provider,
  );
}

export function createReadOnlyTokenMessengerProgramInterface(
  programId: PublicKeyInitData,
  connection?: Connection,
): Program<TokenMessenger> {
  return createTokenMessengerProgramInterface(
    programId,
    utils.createReadOnlyProvider(connection),
  );
}

export function createMessageTransmitterProgramInterface(
  programId: PublicKeyInitData,
  provider?: Provider,
): Program<MessageTransmitter> {
  return new Program<MessageTransmitter>(
    idl.MessageTransmitterIdl as MessageTransmitter,
    new PublicKey(programId),
    provider === undefined ? ({ connection: null } as any) : provider,
  );
}

export function createReadOnlyMessageTransmitterProgramInterface(
  programId: PublicKeyInitData,
  connection?: Connection,
): Program<MessageTransmitter> {
  return createMessageTransmitterProgramInterface(
    programId,
    utils.createReadOnlyProvider(connection),
  );
}
