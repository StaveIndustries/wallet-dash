import { useCallback, useState } from 'react';
import ConnectButton from './components/ConnectButton';
import BalanceList from './components/BalanceList';
import HistoryList from './components/HistoryList';
import SendForm from './components/SendForm';
import NetworkSwitch from './components/NetworkSwitch';
import {
  connectWallet,
  loadBalances,
  loadHistory,
  sendPayment,
} from './lib/stellar';
import type { AssetBalance, Network, TxItem } from './lib/types';

const PAGE_SIZE = 10;

export default function App() {
  // Connected wallet address (empty = signed out).
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<Network>('testnet');
  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [items, setItems] = useState<TxItem[]>([]);
  const [cursor, setCursor] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Load balances + first history page after connect or network switch.
  const refresh = useCallback(
    async (addr: string, net: Network) => {
      setLoading(true);
      try {
        setBalances(await loadBalances(addr, net));
        const page = await loadHistory(addr, net, PAGE_SIZE);
        setItems(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.items.length === PAGE_SIZE);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  async function handleConnect() {
    const key = await connectWallet();
    setAddress(key);
    await refresh(key, network);
  }

  function handleDisconnect() {
    setAddress('');
    setBalances([]);
    setItems([]);
  }

  async function handleNetwork(net: Network) {
    setNetwork(net);
    if (address) await refresh(address, net);
  }

  async function loadMore() {
    setLoading(true);
    try {
      const page = await loadHistory(address, network, PAGE_SIZE, cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.items.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(v: { to: string; amount: string; memo: string }) {
    const hash = await sendPayment({
      sourceAddress: address,
      destination: v.to,
      amount: v.amount,
      memo: v.memo || undefined,
      network,
    });
    setNotice(`Sent! ${hash.slice(0, 12)}...`);
    await refresh(address, network);
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <header className="flex items-center justify-between">
        <h1>Wallet Dash</h1>
        <NetworkSwitch network={network} onChange={handleNetwork} />
      </header>
      <ConnectButton address={address} onConnect={handleConnect} onDisconnect={handleDisconnect} />
      {address && (
        <main>
          <section aria-label="Balances">
            <h2>Balances</h2>
            <BalanceList balances={balances} loading={loading && balances.length === 0} />
          </section>
          <section aria-label="Send payment">
            <h2>Send</h2>
            <SendForm onSend={handleSend} />
            {notice && <p role="status">{notice}</p>}
          </section>
          <section aria-label="History">
            <h2>History</h2>
            <HistoryList items={items} loading={loading} onLoadMore={loadMore} hasMore={hasMore} />
          </section>
        </main>
      )}
    </div>
  );
}
