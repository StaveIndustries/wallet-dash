import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectButton from '../src/components/ConnectButton';
import BalanceList from '../src/components/BalanceList';
import SendForm from '../src/components/SendForm';

describe('ConnectButton', () => {
  it('renders connect and calls onConnect', async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn().mockResolvedValue(undefined);
    render(<ConnectButton address="" onConnect={onConnect} onDisconnect={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Connect wallet' }));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('shows address and disconnect when connected', async () => {
    const user = userEvent.setup();
    const onDisconnect = vi.fn();
    render(
      <ConnectButton address="GABC1234" onConnect={async () => {}} onDisconnect={onDisconnect} />,
    );
    expect(screen.getByLabelText('Connected address')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Disconnect wallet' }));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('BalanceList', () => {
  it('shows loading state', () => {
    render(<BalanceList balances={[]} loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading balances');
  });

  it('renders balances', () => {
    render(
      <BalanceList
        balances={[{ code: 'XLM', issuer: null, balance: '100.5' }]}
        loading={false}
      />,
    );
    expect(screen.getByText('XLM')).toBeInTheDocument();
    expect(screen.getByText(/100\.5/)).toBeInTheDocument();
  });
});

describe('SendForm', () => {
  it('rejects a bad address with a message', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<SendForm onSend={onSend} />);
    await user.type(screen.getByLabelText('Destination address'), 'nope');
    await user.type(screen.getByLabelText('Amount'), '10');
    await user.click(screen.getByRole('button', { name: 'Send payment' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('valid Stellar address');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('rejects a bad amount with a message', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<SendForm onSend={onSend} />);
    await user.type(screen.getByLabelText('Destination address'), 'G' + 'A'.repeat(55));
    await user.type(screen.getByLabelText('Amount'), '0');
    await user.click(screen.getByRole('button', { name: 'Send payment' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('positive number');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('submits good values', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<SendForm onSend={onSend} />);
    await user.type(screen.getByLabelText('Destination address'), 'G' + 'A'.repeat(55));
    await user.type(screen.getByLabelText('Amount'), '5');
    await user.click(screen.getByRole('button', { name: 'Send payment' }));
    expect(onSend).toHaveBeenCalledWith({ to: 'G' + 'A'.repeat(55), amount: '5', memo: '' });
  });
});
