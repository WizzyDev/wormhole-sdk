import {
  Algodv2,
  LogicSigAccount,
  SuggestedParams,
  Transaction,
  getApplicationAddress,
  makeApplicationOptInTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  signLogicSigTransaction,
} from "algosdk";
import {
  SEED_AMT,
  TransactionSet,
  TransactionSignerPair,
  safeBigIntToNumber,
} from "@wormhole-foundation/connect-sdk-algorand";

/**
 * Checks to see if the account exists for the application
 * @param client An Algodv2 client
 * @param appId Application ID
 * @param acctAddr Account address to check
 * @returns True, if account exists for application, False otherwise
 */
export async function storageAccountExists(
  client: Algodv2,
  address: string,
  appId: bigint,
): Promise<boolean> {
  try {
    const acctAppInfo = client
      .accountApplicationInformation(address, safeBigIntToNumber(appId))
      .do();
    return Object.keys(acctAppInfo).length > 0;
  } catch (e) {}
  return false;
}

/**
 * Constructs opt in transactions
 * @param client An Algodv2 client
 * @param senderAddr Sender address
 * @param appId Application ID
 * @param storage StorageLogicSig
 * @returns Address and array of TransactionSignerPairs
 */
export async function maybeCreateStorageTx(
  client: Algodv2,
  senderAddr: string,
  appId: bigint,
  storage: LogicSigAccount,
  suggestedParams?: SuggestedParams,
): Promise<TransactionSet> {
  const appAddr: string = getApplicationAddress(appId);
  const storageAddress = storage.address();

  const txs: TransactionSignerPair[] = [];

  try {
    const exists = await storageAccountExists(client, storageAddress, appId);
    if (exists) return { accounts: [storageAddress], txs };
  } catch {}

  suggestedParams = suggestedParams ?? (await client.getTransactionParams().do());

  const seedTxn = makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddr,
    to: storageAddress,
    amount: SEED_AMT,
    suggestedParams,
  });
  seedTxn.fee = seedTxn.fee * 2;
  txs.push({ tx: seedTxn, signer: null });

  const optinTxn = makeApplicationOptInTxnFromObject({
    from: storageAddress,
    suggestedParams,
    appIndex: safeBigIntToNumber(appId),
    rekeyTo: appAddr,
  });
  optinTxn.fee = 0;
  txs.push({
    tx: optinTxn,
    signer: {
      address: storage.address(),
      signTxn: (txn: Transaction) => Promise.resolve(signLogicSigTransaction(txn, storage).blob),
    },
  });

  return {
    accounts: [storageAddress],
    txs,
  };
}