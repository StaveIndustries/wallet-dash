import { useState } from 'react';

// Send-payment form: destination, amount, optional memo. Validates locally,
// then calls onSend. Fee preview line included for the confirmation issue (#8).
export default function SendForm({ onSend }: { onSend: (v: { to: string; amount: string; memo: string }) => Promise<void> }) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  function valid(): boolean {
    if (!/^G[A-Z2-7]{55}$/.test(to.trim())) {
      setError('Destination must be a valid Stellar address.');
      return false;
    }
    const n = Number(amount);
    if (!amount.trim() || !Number.isFinite(n) || n <= 0) {
      setError('Amount must be a positive number.');
      return false;
    }
    if (memo.length > 28) {
      setError('Memo must be 28 characters or fewer.');
      return false;
    }
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!valid()) return;
    setSending(true);
    try {
      await onSend({ to: to.trim(), amount: amount.trim(), memo });
      setTo('');
      setAmount('');
      setMemo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} aria-label="Send payment form">
      <label>
        Destination (G...)
        <input aria-label="Destination address" value={to} onChange={(e) => setTo(e.target.value)} placeholder="G..." />
      </label>
      <label>
        Amount (XLM)
        <input aria-label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10" />
      </label>
      <label>
        Memo (optional)
        <input aria-label="Memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="thanks" />
      </label>
      <p>Network fee preview: 0.00001 XLM base fee per operation.</p>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={sending} aria-label="Send payment">
        {sending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
