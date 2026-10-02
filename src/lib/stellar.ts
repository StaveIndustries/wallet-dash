import * as StellarSdk from '@stellar/stellar-sdk';
import { NETWORKS, type AssetBalance, type Network, type TxItem } from './types';

// Freighter injects window.freighterApi. Everything guards so the UI still
// renders with no wallet installed.
declare global {
  interface Window {
    freighterApi?: {
      getPublicKey(): Promise<string>;
      signTransaction(xdr: string, opts?: Record<string, unknown>): Promise<{ signedTxXdr: string }>;
    };
  }
}

/** True when a Freighter-compatible wallet is installed. */
export function hasWallet(): boolean {
  return typeof window !== 'undefined' && !!window.freighterApi;
}

function requireWallet() {
  if (!window.freighterApi) throw new Error('Install a Freighter-compatible wallet to continue.');
  return window.freighterApi;
}

function server(network: Network) {
  return new StellarSdk.Horizon.Server(NETWORKS[network].horizonUrl);
}

/** Request the public key from the wallet. */
export async function connectWallet(): Promise<string> {
  return requireWallet().getPublicKey();
}

/** Load XLM + asset balances for an address. */
export async function loadBalances(address: string, network: Network): Promise<AssetBalance[]> {
  const account = await server(network).loadAccount(address);
  return account.balances.map((b) => {
    if (b.asset_type === 'native') {
      return { code: 'XLM', issuer: null, balance: b.balance };
    }
    const line = b as { asset_code: string; asset_issuer: string; balance: string };
    return { code: line.asset_code, issuer: line.asset_issuer, balance: line.balance };
  });
}

/** Recent transactions, newest first. */
export async function loadHistory(
  address: string,
  network: Network,
  limit = 10,
  cursor?: string,
): Promise<{ items: TxItem[]; nextCursor: string }> {
  let q = server(network).transactions().forAccount(address).order('desc').limit(limit);
  if (cursor) q = q.cursor(cursor);
  const page = await q.call();
  return {
    items: page.records.map((t) => ({
      hash: t.hash,
      type: 'transaction',
      createdAt: t.created_at,
    })),
    nextCursor: page.records.length > 0 ? page.records[page.records.length - 1].paging_token : cursor ?? '',
  };
}

/** Build, Freighter-sign, and submit a native XLM payment. Returns the hash. */
export async function sendPayment(opts: {
  sourceAddress: string;
  destination: string;
  amount: string;
  memo?: string;
  network: Network;
}): Promise<string> {
  const api = requireWallet();
  const srv = server(opts.network);
  const source = await srv.loadAccount(opts.sourceAddress);
  const builder = new StellarSdk.TransactionBuilder(source, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORKS[opts.network].passphrase,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination: opts.destination,
      asset: StellarSdk.Asset.native(),
      amount: opts.amount,
    }),
  );
  if (opts.memo) builder.addMemo(StellarSdk.Memo.text(opts.memo));
  const tx = builder.setTimeout(120).build();
  const { signedTxXdr } = await api.signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORKS[opts.network].passphrase,
  });
  const signed = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORKS[opts.network].passphrase);
  const result = await srv.submitTransaction(signed as StellarSdk.Transaction);
  return result.hash;
}
