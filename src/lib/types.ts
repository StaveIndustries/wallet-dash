/** Networks supported by the header toggle. */
export type Network = 'testnet' | 'mainnet';

export const NETWORKS: Record<
  Network,
  { horizonUrl: string; passphrase: string; label: string }
> = {
  testnet: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    label: 'Testnet',
  },
  mainnet: {
    horizonUrl: 'https://horizon.stellar.org',
    passphrase: 'Public Global Stellar Network ; September 2015',
    label: 'Mainnet',
  },
};

export interface AssetBalance {
  code: string;
  issuer: string | null;
  balance: string;
}

export interface TxItem {
  hash: string;
  type: string;
  createdAt: string;
}
