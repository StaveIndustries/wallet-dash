import { useState } from 'react';

/** Connect button: connects Freighter, shows address, disconnects. */
export default function ConnectButton({
  address,
  onConnect,
  onDisconnect,
}: {
  address: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle() {
    setError('');
    setBusy(true);
    try {
      await onConnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connect failed.');
    } finally {
      setBusy(false);
    }
  }

  if (address) {
    return (
      <div>
        <span aria-label="Connected address">{address.slice(0, 8)}...</span>
        <button onClick={onDisconnect} aria-label="Disconnect wallet">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handle} disabled={busy} aria-label="Connect wallet">
        {busy ? 'Connecting...' : 'Connect wallet'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
