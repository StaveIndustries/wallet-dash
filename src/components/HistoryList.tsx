import type { TxItem } from '../lib/types';

/** Transaction history with pagination and an empty state. */
export default function HistoryList({
  items,
  loading,
  onLoadMore,
  hasMore,
}: {
  items: TxItem[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}) {
  if (loading && items.length === 0) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading history">
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return <p>No transactions yet for this account.</p>;
  }

  return (
    <div>
      <ul aria-label="Transaction history">
        {items.map((t) => (
          <li key={t.hash}>
            <code>{t.hash.slice(0, 12)}...</code> - {t.createdAt}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button onClick={onLoadMore} disabled={loading} aria-label="Load more transactions">
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
