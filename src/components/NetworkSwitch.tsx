import type { Network } from '../lib/types';
import { NETWORKS } from '../lib/types';

/** Testnet/mainnet switch rendered in the header. */
export default function NetworkSwitch({
  network,
  onChange,
}: {
  network: Network;
  onChange: (n: Network) => void;
}) {
  return (
    <label>
      Network
      <select
        aria-label="Stellar network"
        value={network}
        onChange={(e) => onChange(e.target.value as Network)}
      >
        {(Object.keys(NETWORKS) as Network[]).map((n) => (
          <option key={n} value={n}>
            {NETWORKS[n].label}
          </option>
        ))}
      </select>
    </label>
  );
}
