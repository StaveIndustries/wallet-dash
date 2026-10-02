# Wallet Dash

A clean Stellar wallet dashboard. Connect with Freighter, see balances and
history, send payments. Frontend only - no custom backend; all data comes
straight from Horizon.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
```

Use testnet while developing. Switch networks from the header toggle.

## Features

- Wallet connect / disconnect (Freighter)
- Dashboard: address, XLM balance, asset balances
- Transaction history with pagination
- Send payment form (amount + memo)
- Testnet / mainnet switch
- Mobile-first responsive layout

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm test` - Vitest + React Testing Library suite

## Contributing

See CONTRIBUTING.md. Good first issues are labeled for newcomers.

## License

MIT - see LICENSE.
