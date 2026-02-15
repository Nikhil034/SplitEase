# SplitEase

Split expenses, send payments, and get paid—with ease. Built on [Tempo](https://tempo.xyz) with [Privy](https://privy.io) for wallet authentication.

## Features

- **Wallet**: Send and receive alphaUSD, batch send, transaction memos
- **Split (expense groups)**: Create groups, add members by email or phone, log expenses, see who owes whom, one-tap settle on Tempo
- **Invoices & receipts**: Create invoices with a memo; when the client pays with that memo, the invoice is marked paid automatically. Invoice history and receipt view with memo reconciliation.
- **Automatic notifications when paid**: In-app toast when you receive a payment (polling-based).
- **Revenue splitting (collaborations)**: Define a project with total revenue and split percentages per collaborator (email/phone). Track who gets what.
- **Time-based auto pay**: Schedule a payment to run at a specific date and time. Runs when the app tab is open (client-side check every minute).
- **Analysis**: Summary of total sent/received and a log of actions (sends, settles, invoices, scheduled payments, group creation, etc.).

## Tech Stack

- [Next.js](https://nextjs.org) 15 with App Router
- [Tempo SDK](https://www.npmjs.com/package/tempo.ts) (`tempo.ts`)
- [Privy](https://privy.io) for wallet management
- [Viem](https://viem.sh) for Ethereum interactions
- [TailwindCSS](https://tailwindcss.com) for styling

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Copy the example environment file and add your Privy credentials:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Implementation Details

### How Privy Is Used

Privy provides two key functions in this app:

**1. Sender Wallet (always used)**

When you log in via email or SMS, Privy automatically creates an embedded wallet for you. No seed phrases or extensions needed. This wallet signs all your transactions.

**2. Recipient Lookup (optional)**

You can send to recipients in two ways:

| Recipient Type | Example | Privy Used? |
|----------------|---------|-------------|
| Wallet address | `0x1234...abcd` | No - sends directly to address |
| Email | `friend@example.com` | Yes - Privy looks up or creates their wallet |
| Phone | `+14155551234` | Yes - Privy looks up or creates their wallet |

When sending to an email/phone, Privy either finds the recipient's existing wallet or creates a new one. The recipient can then log in with that email/phone to access their funds.

### Split (expense groups)

- **Groups**: Create a group and add members by email or phone.
- **Expenses**: Add amount, description, who paid, and who to split between.
- **Balances**: Automatic calculation of who owes whom; one-tap settle with pre-filled send (recipient, amount, memo).

### Invoices & receipts

- Create an invoice with recipient, amount, description, and a **memo** (e.g. "Invoice #123"). Share the memo with the payer.
- When someone sends you funds on Tempo with that memo, the app reconciles incoming transactions and marks the invoice as **paid**.
- View invoice history (pending / paid) and open a **receipt** (description, amount, memo, paid date, tx link).

### Auto pay

- Schedule a payment (recipient, amount, memo, date and time). When the scheduled time is reached, the payment is sent automatically **if the app tab is open** (browser checks every minute).

### Analysis

- **Total sent / total received** from your transaction history.
- **Activity log**: Sends, settles, invoice created, collaboration created, scheduled payments (and when they run). Stored in `localStorage` for the session.

Data (groups, expenses, invoices, scheduled payments, collaborations, action log) is stored in `localStorage`. Sign in with **email or phone** so you appear as a member in groups and can use settle and analysis.

### Transaction Memos

Memos are attached to transfers using the `memo` parameter (TIP-20 feature):

```typescript
await client.token.transferSync({
  to: recipient,
  amount: parseUnits(amount, metadata.decimals),
  memo: stringToHex(memo),
  token: alphaUsd,
});
```

## Resources

- [Tempo Documentation](https://docs.tempo.xyz)
- [Privy Documentation](https://docs.privy.io)
- [Viem Documentation](https://viem.sh)
