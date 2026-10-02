import type { AssetBalance } from '../lib/types';

/** Balance list: XLM + assets with a loading skeleton state. */
export default function BalanceList({
  balances,
  loading,
}: {
  balances: AssetBalance[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading balances">
        <p>Loading balances...</p>
      </div>
    );
  }

  if (balances.length === 0) {
    return <p>No balances found for this account.</p>;
  }

  return (
    <ul aria-label="Asset balances">
      {balances.map((b) => (
        <li key={`${b.code}-${b.issuer ?? 'native'}`}>
          <strong>{b.code}</strong>: {b.balance}
        </li>
      ))}
    </ul>
  );
}
